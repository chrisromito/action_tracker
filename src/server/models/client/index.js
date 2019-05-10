/**
 * @module client - Facilitates a o2m relationship between client -> domains (respectively)
 * `Client` represents a customer that uses this application.
 * `Domain` represents a web domain/url/location of a client.
 * 
 * The 1[Client] -> Many[Domains] makes it easier to deal with sub-domains, migrations, business name changes,
 * etc., while allowing a reference back to a single entity that registered w/ our application
 */

const { Client } = require('./client')
const { Domain } = require('./domain')

module.exports = { Client, Domain }