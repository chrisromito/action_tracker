const moment = require('moment')
const R = require('ramda')
// Stemmer - parses words to remove the 'white noise' that messes with
// string-similarity algorithms
const stemmer = require('stemmer')
const stringSimilarity = require('string-similarity')
const { Container, BaseApplicative } = require('../../shared/functional_types/base')



const reduceToMap = R.curry(
    (fn, arr)=> arr.reduce((accum, item, index)=> {
        const pair = fn(accum, item, index)
        accum[pair[0]] = pair[1]
        return accum
    }, {})
)



const serializeString = R.compose(
    R.join(' '),
    R.map(stemmer),
    R.split(' '),
    R.toLower
)


const serializeValue = R.compose(
    R.clamp(0, 1),
    Math.abs
)



const nowAsNumber = Number(Date.now())

const safeDate = (value)=> (
    R.isNil(value) || !value || isNaN(value)
) ? nowAsNumber : parseFloat(value)



/**
 * Fields
 *==============================*/

class Field extends Container {
    constructor(lens) {
        /**
         * @param {Function} lens - See Ramda.lens
         */
        super(lens)
        this.lens = lens
    }

    view(obj) {
        /**
         * Get the value from 'obj'
         * @param {Object} obj
         * @returns {*}
         */
        return R.view(this.lens, obj)
    }

    set(...args) {
        return R.view(this.lens, ...args)
    }

    over(...args) {
        return R.over(this.lens, ...args)
    }

    compose(fn) {
        /**
         * @method compose :: Field a => (a => Field b)=> Field b
         * @param {Function} fn - A unary function that will wrap this.view
         */
        const cls = this._Cls()
        return (obj)=> fn(
            new cls(this.lens).view(obj)
        )
    }

    serialize(obj) {
        /*
         * Base class does nothing, just gets the value
         */
        return this.view(obj)
    }

    similarity(query) {
        return (obj)=> this.view(obj) === query ? 1 : 0
    }
}




class TextField extends Field {

    serialize(obj) {
        return serializeString(this.view(obj))
    }


    similarity(query) {
        /**
         * @method similarity :: a {String}=> (obj) => {Number}
         * Get the % similarity between `query` & this.view(obj)
         * This handles string serialization prior to comparison
         * Similarity is a Number between 0 and 1 
         *
         * @param query {String}
         * @returns ({Object})=> {Number}
         */
        const serializedQuery = serializeString(query)
        const similarity = R.compose(
            serializeValue,
            R.curry(stringSimilarity.compareTwoString)(serializedQuery),
            (obj)=> this.view(obj)
        )

        return this.compose(similarity)
    }
}




class DateField extends Field {
    serialize(obj) {
        return parseFloat(this.view(obj))
    }

    similarity(relative_date=nowAsNumber) {
        /**
         * @method similarity :: [d=Number] => (obj) => {Number}
         * @param {Number=Number(Date.now())} relative_date - Date
         * to compare the object's Date to.
         * Date must be formatted as milliseconds since Unix Epoch,
         * like you would receive from Date.now()
         * @returns ({Object})=> {Number}
         */
        const dateAsNumber = safeDate(relative_date)
        const serializePred = R.compose(
            serializeValue,
            (obj)=> dateAsNumber - this.serialize(obj)
        )
        return serializePred
    }
}


const defaultConfig = {
    debug: true
}


/**
 * @class FieldSpec - Class that makes it easier to group fields together.
 * Accepts an Object of field name/Field Instance key/value pairs
 * 
 * The field map helps the `FieldSpec.similarity` method compare an Array of Objects to
 * a `query` object using the `similarity` functions of each respective field
 */
class FieldSpec {
    constructor(field_map, config=defaultConfig) {
        /**
         * @param {Field[]} field_map - An Object with the property names as keys,
         *   and values being Field instances
         * @param {Object={}} config - Optional config object,
         *   can be used for debugging and stuff
         */
        this.field_map = field_map
        this.config = config

        this._spec = null
    }

    setQuery(query_map) {
        /**
         * @method setQuery :: q => (obj {Spec})=> obj
         *   This builds out an Object of Functions using the fields' `similarity` methods
         *   which are used to build out Objects that contain the `similarity` between
         *   the query Object (user input) to the Output Object (concrete data)
         * @param {Object} query_map - The Object of query key/value pairs
         * @returns {Object}
         */
        const field_map = this.field_map
        const querySimilarity = (map_key)=> field_map[map_key].similarity(query_map[map_key])
        
        const queryMap = reduceToMap(
            (accum, item)=> [item, querySimilarity(item)],
            Object.keys(field_map)
        )

        this._spec = queryMap
        return queryMap
    }

    similarity(query_map, data) {
        /**
         * @method similarity :: d => l
         * Get comparison values for a list of Objects 
         * using this._spec as the 'spec' to compare the value
         * of each Object's field property value to the respective
         * query's property value
         * 
         * @param {Object} query_map - Query data to compare each object to
         * @param {Object} data - Data to compare to the query data
         * @returns {Object[]} Object of comparison values (Floats between 0-1)
         */
        const field_map = this.field_map
        const specMap = this._spec ? this._spec : this.setQuery(query_map)
        // specMap provides a way to look up the predicate
        // returned by `myField.similarity()`.
        // Since the predicate function always accepts
        // an Object and returns a Float, we just need
        // to return an Object of comparisons (Floats)
        const comparisonMap = reduceToMap(
            (accum, item)=> [item, (specMap[item])(data)],
            Object.keys(field_map)
        )

        return comparisonMap
    }
}


module.exports = {
    serializeString,
    serializeValue,
    Field,
    TextField,
    DateField,
    FieldSpec
}