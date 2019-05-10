/**
 * @module client - Provides the Client mongoose model, which is responsible for
 * maintaining clients/customers, their information, and their domains
 */

const { Schema, model } = require('mongoose')
const { genericFields } = require('../utils/common_schemas')

const clientSchemaFields = {
    active: {
        type: Boolean,
        default: false
    },

    domains: [{
        ref: 'Domain',
        type: Schema.Types.ObjectId,
        required: true
    }],

    // TODO: Add client key, client secret key, internal key, & internal secret key
    // for authentication purposes
}

const ClientSchema = new Schema({ ...genericFields, ...clientSchemaFields })

const Client = model('Client', ClientSchema)

module.exports = { Client }