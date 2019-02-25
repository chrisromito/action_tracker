const moment = require('moment')
const R = require('ramda')
const { ActionInterface, SearchActionInterface } = require('../../shared/interfaces/index')
const {
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
const queryLens = R.lensPath(['query'])

const SearchActionSerializer = (action)=> ({

})





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


    // Models & Actual test functions
    Action,
    getTestActionPair,
    saveTestData,
    getTestData
}


const _COPY_PASTE = `

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
    Action,
    getTestActionPair,
    saveTestData,
    getTestData
} = require('./src/server/neural/test.action.search')


`