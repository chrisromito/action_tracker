/**
 * @module user/interfaces - Provides interface for getting/setting values in Express Request Sessions
 * This exists solely to avoid having to search through the codebase to figure out how the hell to get the accountId
 */

const R = require('ramda')

 
const SessionMonad = (request)=> ({
    value: ()=> ({
        clientId: request.session.clientId || null,
        domainId: request.session.domainId || null,
        accountId: request.session.accountId || null,
        user: request.session.user || null,
        sessionId: request.session.sessionId || null
    }),

    map: ({ accountId=undefined, clientId=undefined, domainId=undefined, user=undefined, sessionId=undefined})=> {
        // Set the key/val pairs on the request.session & return the request
        const obj = {accountId, clientId, domainId, user, sessionId}
        Object.entries(obj)
            .filter(([k, v])=> v !== undefined)
            .forEach(([k, v])=> request.session[k] = v)
        return request
    }
})


const sessionLens_ = R.lensPath(['session'])
const composeSession = (propName)=> R.compose(sessionLens_, R.lensPath([propName]))

SessionMonad.lenses = {
    accountId: R.lensPath(['accountId']),
    clientId: R.lensPath(['clientId']),
    sessionId: R.lensPath(['sessionId']),
    user: R.lensPath(['user']),

    requestAccountId: composeSession('accountId'),
    requestClientId: composeSession('clientId'),
    requestSessionId: composeSession('sessionId'),
    requestUser: composeSession('user'),
}

module.exports = SessionMonad