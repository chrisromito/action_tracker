/**
 * @module data - Comprises the Sub Model & Data Model layers/components
 * @exports SubModel
 * @exports DataModel
 */

const R = require('ramda')
const { Future, Maybe } = require('ramda-fantasy')
const { BaseType, DataState } = require('./types')
const { PageView, Client, User, UserSession, NeuralStep } = require('../../models')


//-- Utils
const transformModels = R.compose(JSON.parse, JSON.stringify)


//-- PageView Sub Model

const clientPageViewsSince = (_, {clientId, minDate})=> PageView.find()
    .where('page.client', clientId)
    .or([
        { updated: minDate },
        { created: minDate }
    ])
    .populate('page')
    .populate('children')
    .populate({
        path: 'userSession',
        populate: {
            path: 'user',
            select: 'account active updated created'
        }
    })
    .exec()
    .then(transformModels)


const futurePageViewsSince = (dataState)=> Future((reject, resolve)=>
    clientPageViewsSince(...dataState.args())
        .then((pageViews)=> dataState.mapData(()=> pageViews))
        .then(resolve)
        .catch(reject)
)


/**
 * @func PvSubModel - Handles query logic for Client PageViews
 * 
 */
const PvSubModel = ()=> ({
    value: (dataState)=> futurePageViewsSince(dataState)
})


const userSessionLens = R.lensPath(['userSession', '_id'])

const sequenceLens = R.lensPath(['sequence'])

const urlLens = R.lensPath(['url'])


/**
 * @func PvModel - Data transformations for PageViews
 * @param {(DataState|*)} arg
 */
const PvModel = (arg)=> ({
    map: (fn)=> PvModel(arg.map(fn)),
    mapData: (fn)=> PvModel(arg.mapData(fn)),
    mapContext: (fn)=> PvModel(arg.mapContext(fn)),

    filterByUserSession: ()=> PvModel(arg).mapData(
        R.reject(
            R.pipe(
                R.view(userSessionLens),
                R.isNil
            )
        )
    ),

    groupByUserSession: ()=> PvModel(arg).mapData(
        R.groupWith(R.view(userSessionLens))
    ),

    setUrl: ()=> PvModel(arg).mapData(
        R.over(
            urlLens,
            R.view(R.lensPath(['page', 'index']))
        )
    ),

    sort: ()=> PvModel(arg).mapData(
        R.sortBy(R.view(sequenceLens))
    ),

    value: ()=> arg
})


//-- NeuralStep Sub Model

const lastStep = (_, {clientId})=> NeuralStep.find()
    .where('client', clientId)
    .where('originModel', 'PageView')
    .sort('timestamp', 'desc')
    .limit(1)
    .exec()


const NeuralSubModel = ()=> ({
    getLastStep: (dataState)=> Future((reject, resolve)=>
        lastStep(...dataState.args())
            .then(transformModels)
            .then(resolve)
            .catch(reject)
    )
})


/**
 * @func NeuralModel - Data transformations for NeuralSteps
 * @param {(DataState|*)} arg
 */
const NeuralModel = (arg)=> ({
    map: (fn)=> NeuralModel(arg.map(fn)),
    mapData: (fn)=> NeuralModel(arg.mapData(fn)),
    mapContext: (fn)=> NeuralModel(arg.mapContext(fn)),

    getLastStep: (arg)=> {
        const lastStep = Maybe(
            R.prop(0, arg.data())
        )
        // If we have a last step, set our 'minDate' value based on the step's 'timestamp' value
        const minDate = lastStep.isJust
            ? lastStep.timestamp
            : null
        const setContext = R.set(R.lensPath(['minDate']), minDate)
        return NeuralModel(arg).mapContext(setContext)
    },

    value: ()=> arg
})



module.exports = {
    PvSubModel,
    PvModel,
    NeuralSubModel,
    NeuralModel
}