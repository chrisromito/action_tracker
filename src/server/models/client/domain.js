/**
 * @module domain - Provides the Domain mongoose model, which relates
 * to a Client instance.
 * This allows us to 'whitelist' domains that we accept requests from
 */

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