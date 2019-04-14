/**
 * @module user/interfaces - Provides interface for getting/setting values in Express Request Sessions
 * This exists solely to avoid having to search through the codebase to figure out how the hell to get the accountId
 */

 
const SessionMonad = (request)=> ({
    value: ()=> ({
        accountId: request.session.accountId,
        user: request.session.user,
        sessionId: request.session.sessionId
    }),

    map: ({ accountId=undefined, user=undefined, sessionId=undefined})=> {
        // Set the key/val pairs on the request.session & return the request
        const obj = {accountId, user, sessionId}
        Object.entries(obj)
            .filter(([k, v])=> v !== undefined)
            .forEach(([k, v])=> request.session[k] = v)
        return request
    }
})

module.exports = SessionMonad