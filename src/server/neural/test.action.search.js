/**
 * @TODO: (2019-Feb-28) Make this an actual test file instead of a scratch file. =D
 *    - Populate 'Action' model w/ test data that mocks a "User Search" feature
 *    - Assess if FieldSpec is a pain in the ass.  Would we be better off w/ an ActionFieldSpec type-of-deal?
 *    - Get metrics for efficiency & efficacy; adjust hidden layers accordingly.
 */
const moment = require('moment')
const R = require('ramda')
const Maybe = require('maybe')
const { ActionInterface, SearchActionInterface } = require('../../shared/interfaces/index')
const {
    reduceToMap,
    serializeString,
    serializeValue,
    Field,
    TextField,
    DateField,
    FieldSpec
} = require('./field')
const { Action, NeuralStep } = require('../models/index')



/**
 * Constants
 */
const searchActionType = 'search'
const selectedActionType = 'search.select'


/**
 * Utils
 */
const toPlainObject = R.compose(JSON.parse, JSON.stringify)

const searchActionFilter = R.filter(R.propEq('actionType', searchActionType))
const selectedActionFilter = R.filter(R.propEq('actionType', selectedActionType))




/**
 * FieldSpec for 'Songs' Network
 */
const TestFieldSpec = new FieldSpec({
    name: TextField.of(R.lensPath(['name'])),
    timestamp: DateField.of(R.lensPath(['timestamp']))
})


// 'The Violent Sleep of Reason' release date in Milliseconds since Unix Epoch
const releaseDate = moment().year(2016)
    .month('October')
    .date(7)
    .valueOf()

// Output Layer = testAlbum.songs
const testAlbum = {
    name: 'The Violent Sleep of Reason',
    artist: 'Meshuggah',
    released: releaseDate,
    songs: [
        'Clockworks',
        'Born in Dissonance',
        'MonstroCity',
        'By the Ton',
        'Violent Sleep of Reason',
        'Ivory Tower',
        'Stifled',
        'Nostrum',
        'Our Rage Won\'t Die',
        'Into Decay'
    ]
}

const randomIntBetween = (min, max)=> Math.floor(
    Math.random() * (max - min)
) + min


const randomQueryString = (str)=> str.slice(0,
    randomIntBetween(2, str.length)
)


const getTestActionPair = (album)=> {
    const songs = R.prop('songs', album)
    const index = randomIntBetween(0, songs.length)
    const songName = R.prop(index, songs)

    const searchAction = {
        actionType: searchActionType,
        breadCrumbs: [],
        target: {
            name: 'Song', // Fake model name
            data: {
                // Data from the search input element (see SearchActionInterface)
                query: randomQueryString(songName),
                name: 'song--search',  // Fake Element Name
            }
        }
    }
    
    const selectedAction = {
        actionType: selectedActionType,
        breadCrumbs: [searchAction],
        target: {
            id: index,
            name: 'Song', // Fake model name
            data: {
                // The action targeted this specific song...
                id: index,
                name: songName,
                released: album.released
            }
        }
    }

    return [searchAction, selectedAction]
}



const saveTestData = ()=> {
    console.log('\n\nsaveTestData \n--------------\n')

    const data = R.range(0, 100).map(()=> getTestActionPair(testAlbum))

    console.log(`\nSaving: ${JSON.stringify(data, null, 4)} \n\n\n`)

    const flatData = R.flatten(data)

    return Action.insertMany(flatData)
        .then((new_actions)=> {
            console.log('\nSuccessfully saved the test actions.')
            return new_actions
        })
}


const getTestData = ()=> Action.find({})
    .or([
        {actionType: searchActionType},
        {actionType: selectedActionType}
    ]).exec()





/**
 * Search Action Neural Net Implementation
 *=====================================*/
const nameLens = R.lensPath(['name'])
const targetLens = R.lensPath(['target'])
const dataLens = R.lensPath(['data'])
const queryLens = R.compose(targetLens, dataLens, R.lensPath(['query']))
const targetNameLens = R.compose(targetLens, dataLens, nameLens)


const SearchActionToInput = (action)=> ({
    name: R.view(queryLens, action),
    timestamp: Date.now()
})


const SelectedActionToOutput = (action)=> ({
    name: R.view(targetNameLens, action),
    timestamp: R.view(
        R.compose(targetLens, dataLens, R.lensPath(['released'])),
        action
    )
})


const serializeSongActions = (actions)=> selectedActionFilter(actions)
    .reduce((accum, action)=> accum.concat({
        query: SearchActionToInput(action.breadCrumbs[0]),
        data: SelectedActionToOutput(action)
    }), [])


const getSerializedTestData = ()=> getTestData().then(serializeSongActions)

const compareSerializedData = (serialized)=> TestFieldSpec.toPair(serialized.query, serialized.data)

const getTestDataSimilarity = ()=> getSerializedTestData()
    .then((actions)=> actions.map(compareSerializedData))
    .catch(console.log)



const getStep = (step_arr)=> Maybe(step_arr.length ? step_arr[0] : null)


const getLastStep = (model_name)=> NeuralStep.find(
    { originModel: model_name },
    null,
    { sort: {timestamp: -1} }
).limit(1)
    .exec()
    .then(getStep)


const stepLeft = ()=> new brain.recurrent.RNNTimeStep()
const stepRight = (mStep)=> {
    const network = new brain.recurrent.RNNTimeStep()
    network.fromJSON(
        JSON.parse(R.prop('meta', mStep.value()))
    )
    return network
}

const stepToNetwork = (mStep)=> mStep.isJust() ? stepRight(mStep) : stepLeft()


const trainModel = (model_name, brain_data)=> {
    const mStep = getLastStep(model_name)
}




/**
 * @exports
 */

module.exports = {
    // Utils to use in the Node shell
    R,
    serializeString,
    serializeValue,
    Field,
    TextField,
    DateField,
    FieldSpec,
    testAlbum,
    randomIntBetween,
    randomQueryString,
    searchActionFilter,
    selectedActionFilter,

    // Models & Actual test functions
    Action,
    getTestActionPair,
    saveTestData,
    getTestData,
    SearchActionToInput,
    SelectedActionToOutput,
    serializeSongActions,
    getSerializedTestData,
    getTestDataSimilarity
}


const _COPY_PASTE = `

var brain = require('brain.js')

var actionSearch = {
    R,
    serializeString,
    serializeValue,
    Field,
    TextField,
    DateField,
    FieldSpec,
    testAlbum,
    randomIntBetween,
    randomQueryString,
    searchActionFilter,
    selectedActionFilter,
    Action,
    getTestActionPair,
    saveTestData,
    getTestData,
    SearchActionToInput,
    SelectedActionToOutput,
    serializeSongActions,
    getSerializedTestData,
    getTestDataSimilarity
} = require('./src/server/neural/test.action.search')


var testData = []

getTestDataSimilarity().then((d)=> testData = d)

`