const moment = require('moment')
const R = require('ramda')
const { ActionInterface } = require('../../shared/interfaces/index')
const {
    serializeString,
    serializeValue,
    Field,
    TextField,
    DateField,
    FieldSpec
} = require('./field')





const TestFieldSpec = new FieldSpec({
    name: TextField.of(R.lensPath(['name'])),
    timestamp: DateField.of(R.lensPath(['timestamp']))
})


// Output Layer = testAlbum.songs
const testAlbum = {
    name: 'The Violent Sleep of Reason',
    artist: 'Meshuggah',
    released: moment('2016/October/07').valueOf(), // Milliseconds since Unix Epoch
    songs: [
        'Clockworks,
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


const getTestObject = (album)=> {
    const songs = R.prop('songs', album)
    const index = randomIntBetween(0, songs)
    const target = R.prop(index, songs)

    // Target == song name
    // Input == serialize(random_part_of_song_name)
    // Output == {id: indexOfSong, name: serializedSongName, timestamp: (album.released.toInt())}
    return {
        input: serializeString(randomQueryString(target)),
        ouput: {
            id: index,
            name: serializeString(target),
            timestamp: R.prop('released', album)
        }
    }
}


const getTestData = ()=> R.times(
    R.thunkify(getTestObject)(testAlbum),
    100
)





/**
 * Search Action Neural Net Implementation
 *=====================================*/
const nameLens = R.lensPath(['name'])
const queryLens = R.lensPath([])

const SearchActionSerializer = (action)=> ({

})


