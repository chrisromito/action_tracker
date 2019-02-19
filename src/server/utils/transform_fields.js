/** @moduel transform_fields : Provides helper functions to deal
 * with transforming Mongoose fields
 */

const R = require('ramda')


/** @constant transformDecimalField:: obj {Object}=> d {Float}
 *  Transforms a '$numberDecimal' object to its underlying float
 * 
 * @param {Object} obj The object associated w/ the field value
 * @returns {Number} The underlying float that the field represents
 */
const transformDecimalField = R.compose(
    parseFloat,
    R.prop('$numberDecimal')
)



/**
 * @constant transformDecimalFields:: arr {String[]}=> o {Object}=> t {Object}
 * @param {String[]} arr: Array of field names that are decimals
 * @param {Object} o The object you want to transform 
 * @returns {Object}: The object w/ the decimal fields set to floats
 */
const transformDecimalFields = (arr)=> {
    return (o)=> {
        return arr.reduce((accum, item)=> {
            accum[item] = transformDecimalField(R.prop(item, o))
            return accum
        }, o)
    }
}


// Serialization utils
const idLens = R.lensProp('id')
const getId = R.prop('_id')
const setId = (o)=> R.set(idLens, getId(o), o)


/** @typedef {Object} Model
 * @property {String} id
 */

/** @typedef {Function} curriedModel
 * @param {Object} o The document object that we will transform
 * @returns {Model}
 */

/** @function serializeModel:: (*=[])=> (o {Object})=> m
 * Parse a model so it's suitable for a JSON response
 * This sets the 'id' property (obtained from o'_id')
 * & sets any decimal fields to their actual Numerical value
 * @param {String[]=[]} decimal_field_arr Optional list of field names
 * that correspond w/ decimal fields
 * @returns {curriedModel}
 */
const serializeModel = (decimal_field_arr=[])=> R.compose(
    transformDecimalFields(decimal_field_arr),
    setId
)



module.exports.transformDecimalField = transformDecimalField
module.exports.transformDecimalFields = transformDecimalFields
module.exports.serializeModel = serializeModel
