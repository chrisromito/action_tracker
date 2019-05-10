/**
 * @module auth - Provides authentication
 * to ensure the request comes from a registered Domain
 */
const { URL } = require('url')
const cors = require('cors')
const { Domain } = require('../models/index')
const SessionMonad = require('../controllers/user/interfaces')


const getWhiteList = (url)=> Domain.find()
    .where('hostname', url.hostname)
    .where('protocol', url.protocol)
    .where('client.active', true)
    .populate('client')
    .limit(1)
    .exec()


const corsConfig = (req, callback)=> {
    const url = req.header('Origin')
    if (!url) {
        // If origin isn't present on the header,
        // then it came from within this application
        return callback(null, { origin: true })
    }
    return getWhiteList(new URL(url))
        .then((domains)=> {
            let isValid = false

            if (domains.length) {
                // If it's valid, set the properties on the request.session
                const { domain } = domains[0]
                SessionMonad.map({ domainId: domain._id,  clientId: domain.client._id })
                isValid = true
            }

            const corsOptions = { origin: isValid }
            callback(null, corsOptions)
        })
}


module.exports = cors(corsConfig)
