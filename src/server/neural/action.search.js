const R = require('ramda')
const { Maybe, Either } = require('ramda-fantasy')
// Internal utils
const Io = require('../../shared/functional_types/io')
const { Container } = require('../../shared/functional_types/base')
// Models & Data
const { Action, actionTypes, NeuralStep } = require('../models/index')
const { FieldSpec } = require('./field')


/**
 * Lenses & Utils
 */
// const nameLens = R.lensPath(['name'])
// const targetLens = R.lensPath(['target'])
// const dataLens = R.lensPath(['data'])
// const queryLens = R.compose(targetLens, dataLens, R.lensPath(['query']))
const timeStampLens = R.lensPath(['timestamp'])

const searchFromSelected = R.view(R.compose(
    R.lensPath(['breadCrumbs']),
    R.lensIndex(0)
))
const selectedActionFilter = R.filter(R.propEq('actionType', actionTypes.searchSelection))


const getLatestActionId = R.compose(
    R.tryCatch(
        R.pipe(R.prop('_id'), R.lensIndex(0)),
        R.always(null)
    ),
    R.sortBy(R.view(timeStampLens))
)


/**
 * Search Action Neural Net Implementation
 *=====================================*/


class NetworkContext extends Container  {
    constructor(data) {
        /**
         * @param {Object} data
         * @property {(RNNTimeStep|null)} network
         * @property {(Action.Query|null)} actions
         * @property {(NeuralStep|null)} step
         */
        super(data)
    }

    extend(new_data) {
        return this.map(R.mergeDeepLeft(new_data))
    }
}


class SearchRelevanceNetwork {
    constructor(modelName, fieldSpec, context=null) {
        /**
         * @param {String} modelName
         * @param {FieldSpec} fieldSpec - What fields are we using to determine relevance?
         */
        this.modelName = modelName
        this.fieldSpec = fieldSpec
        this._context = new NetworkContext(context || {})
    }

    get context() {
        return this._context
    }

    set context(ctx) {
        this._context = this._context.extend(ctx)
    }

    getLastStep() {
        /**
         * @method getLastStep - Get the most recent NeuralStep where
         * this.modelName was 'assessed'
         * @returns {Promise :: => {NeuralStep}}
         */
        const filterParams = { originModel: this.modelName }
        const sortParams = { sort: { timestamp: -1 }}
        return NeuralStep.find(filterParams, null, sortParams)
            .limit(1)
            .exec()
            .then((step)=> {
                this.context = {step}
                return step
            })
    }

    saveStep(network, lastActionId) {
        /**
         * @method saveStep - Save the 'state' of the network by creating
         * a new NeuralStep instance
         * @param {RNNTimeStep} network
         * @param {(String|null)=null} lastActionId
         * @returns {Promise} => {NeuralStep}
         */
        return new NeuralStep({
            origin: lastActionId,
            originModel: 'Action',
            data: network.forecast(),
            meta: JSON.stringify(network.toJSON())
        }).save().then((step)=> {
            this.context = {step}
            return step
        })
    }

    getNetwork(last_step=null) {
        const network = new brain.recurrent.RNNTimeStep()
        const mStep = Maybe(step)
        if (mStep.isJust) {
            // Help the network remember where it left off
            // by lifting the 'meta' property of the NeuralStep Object
            const networkMemoryMeta = R.prop('meta', last_step)
            network.fromJSON(JSON.parse(networkMemoryMeta))
        }
        this.context = { network }
        return network
    }

    getActions(last_step=null) {
        const params = !last_step ? {} : {
            timestamp: {
                $gt: R.view(timeStampLens, last_step)
            }
        }
        
        return Action.find(params)
            .where('target.name', this.modelName)
            .or([
                {actionType: searchActionType},
                {actionType: selectedActionType}
            ]).exec()
            .then((actions)=> {
                this.context = { actions }
                return actions
            })
    }

    actionRelevance(actions) {
        /**
         * @method compare - Get the relativeRelevance of our Search Actions & Selected Actions
         * based on this.fieldSpec
         * @param {Object[]} actions - Actions to assess
         * @returns {Object[]} - Array of Objects w/ 'input' & 'output' key/val pairs mapped
         * to their relevance scores and % relevance, respectively
         */
        const toPair = (action)=> this.fieldSpec.toPair(searchFromSelected(action), action)
        return Io.lift(actions)
            .map(selectedActionFilter)
            .map((selectedActions)=> selectedActions.map(toPair))
            .run()
    }
}


/**
 * @const SearchModelActionTask - Task for Action Model Neural Network.
 * 1 - Looks for a recent NeuralStep for this model.
 *     NOTE: This step + the model name are used to get the Actions
 * 2 - Loads up a RNNTimeStep by either:
 *     A. Creating a new RNNTimeStep network
 *     B. Loading the data from the last time this task ran & passing it into a RNNTimeStep instance
 * 3 - Gets all Actions w/ actionType === 'search.select' & target.name === `modelName`.
 * 4 - Gets the % relevance for all searches that have occurred since the last time this task ran successfully
 * 5 - Trains the RNNTimeStep
 * 6 - Creates a new `NeuralStep` using data from the network:
 *     @property {Object} meta: myRnnTimeStep.toJSON() gives us the ability to 'remember' training models.
 *     @property {Map} data: myRnnTimeStep.forecast() gives us the % relevance values for each field
 *     @property {Action} origin: The '_id' of the last `search.select` action in the data series.
 *     @property {String} originModel: 'Action'
 */
const SearchModelActionTask = (modelName, fieldSpec)=> {
    const actionSearch = SearchRelevanceNetwork(modelName, fieldSpec)
    const lastStep = actionSearch.getLastStep()      // 1. Get our last step

    return lastStep.then(R.tap(
        (step)=> actionSearch.getNetwork(step)       // 2. Get/Set the network
    )).then((step)=> actionSearch.getActions(step))  // 3. Get/Set Actions
    .then((actions)=> {
        const network = lastStep.context.network
        // 4 & 5. Get the relativeRelevance & train the network
        network.train(
            actionSearch.actionRelevance(lastStep.context.actions)
        )

        // 6. Store the network
        actionSearch.saveStep(network, getLatestActionId(actions))
    })
}


module.exports = {
    SearchModelActionTask,
    SearchRelevanceNetwork,
    NetworkContext
}