/**
 * Source:
 * @see https://github.com/doasync/mongoose-extend-schema/blob/master/index.js
 * 
 */

const { Schema } = require('mongoose')


/**
 * @function extendSchema - Create a new Schema from an existing Schema
 * This is analogous to class-based models, in that it allows you to
 * declaratively share functionality across models, except it doesn't
 * use 'traditional inheritance' like you would see with class-based models
 * 
 * @see https://mongoosejs.com/docs/guide.html#options for official documentation
 * 
 * @param {Schema} Schema - Schema you want to extend
 * @param {Object} fields - The fields for your new Schema (ie. the 'subclass')
 * @param {Object} options - Options for this Schema
 * @returns {Schema}
 * 
 * @example
 * >>> const { Schema, model } = require('mongoose')
 * >>> const extendSchema = require('./extend_schema')
 * >>> const MyBaseSchema = new Schema({
 * ...   name: String,
 * ...   sortOrder: { type: Number, required: true, default: 0}
 * ... })
 * >>> const MyExtendedSchema = extendSchema(MyBaseSchema, {
 * ...   email: { type: String, unique: true }}
 * ... )
 * >>> const MyBaseModel = model('MyBaseSchema', MyBaseSchema)
 * >>> const MyExtendedModel = model('MyExtendedModel', MyExtendedModel)
 */

function extendSchema(Schema, fields, options) {
    return new Schema(
        Object.assign({}, Schema.obj, fields),
        options
    )
}

module.exports = extendSchema