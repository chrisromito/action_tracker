/**
 * @module domain - Provides the Domain mongoose model, which relates
 * to a Client instance.
 * This allows us to 'whitelist' domains that we accept requests from
 */

const { Schema, model } = require('mongoose')
const { genericFields } = require('../utils/common_schemas')


const DomainSchemaFields = {
    client: {
        ref: 'Client',
        type: Schema.Types.ObjectId,
        required: true
    },
    host: String,     // Does include the port
    hostname: String, // Doesn't include the port
    port: String,
    protocol: String,  // http, https, ws, etc.
    origin: String
}

const DomainSchema = new Schema({ ...genericFields, ...DomainSchemaFields})

const Domain = model('Domain', DomainSchema)

module.exports = { Domain }