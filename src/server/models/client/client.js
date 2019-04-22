/**
 * @module client - Provides the Client mongoose model, which is responsible for
 * maintaining clients/customers, their information, and their domains
client */

const { Schema, model } = require('mongoose')
const { extendSchema, updatedCreatedSchema } = require('../utils/common_schemas')


const DomainSchema = extendSchema(updatedCreatedSchema, {
    client: {
        ref: 'Client',
        type: Schema.Types.ObjectId,
        required: true
    },

    host: String,
    hostname: String,
    host: String,     // Does include the port
    hostname: String, // Doesn't include the port
    port: String,
    protocol: String,  // http, https, ws, etc.
    origin: String
})

const Domain = model('Domain', DomainSchema)

module.exports = { Domain }