/**
 * @module client - Provides the Client mongoose model, which is responsible for
 * maintaining clients/customers, their information, and their domains
 */

const { Schema, model } = require('mongoose')
const { extendSchema, genericSchema } = require('../utils/common_schemas')


const ClientSchema = extendSchema(genericSchema, {
    domains: [{
        ref: 'Domain',
        type: Schema.Types.ObjectId,
        required: true
    }],

    // TODO: Add client key, client secret key, internal key, & internal secret key
    // for authentication purposes
})

const Client = model('Client', ClientSchema)

module.exports = { Client }