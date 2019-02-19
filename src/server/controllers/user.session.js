
const Maybe = require('maybe')
const R = require('ramda')
const serializeModel = require('../utils/transform_fields').serializeModel
const toPromise = require('../utils/to_promise').toPromise
const _modelIndex = require('../models/index')
const User = _modelIndex.User
const UserSession = _modelIndex.UserSession
const Action = _modelIndex.Action
const {
    tryOrNull,
    viewRequest,
    sessionLens,
    sessionIdLens,
    getUserId,
    getRequestUser
} = require('./common')


/**
 * Get/Set the User
 */


//-- User mutations
// Set the 'active' field for this user
// userRight :: context a => Promise() => User
const userRight = (context)=> User.findOneAndUpdate(
    { id: getUserId(viewRequest(context)).value() },
    { active: true }
).exec()


// Create a User
// userLeft :: => Promise() => User
const userLeft = (context)=> new User({ active: true}).save()


const updateUser = R.ifElse(
    R.compose(
        (m)=> m.isJust(),
        getUserId,
        viewRequest
    ),
    userRight,
    userLeft
)


// Set the user instance on the request session
const setUser = (context)=> updateUser(context)
    .then((user)=> {
        if (Maybe(user).isJust()) {
            const req = context.request
            req.session.user_id = user.id
            req.session.user = user
        }
        return context
    })


//-- IP Address

const requestIp = tryOrNull(
    R.compose(
        (ip_address)=> String(ip_address).split(',')[0].trim(),
        (req)=> req.headers && req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress,
    )
)

const getDevice = tryOrNull(
    (req)=> req.headers['user-agent']
)



// The user does have a session set - get & update the 'active' field for the session
// sessionRight :: context a => Promise() => UserSession
const sessionRight = (context)=> UserSession.findOneAndUpdate(
    { id: R.view(sessionIdLens, viewRequest(context)) },
    { active: true}
).save()


// The user does not have a session set
// sessionLeft :: context a => Promise() => UserSession
const sessionLeft = (context)=> new UserSession({
    user: getRequestUser(context),
    active: true,
    ip_address: requestIp(viewRequest(context)),
    device: getDevice(viewRequest(context))
}).save()
    .then((session)=> {
        const user = getRequestUser(context)
        user.sessions = user.sessions.concat(session._id)
        user.save()
        return session
    })


const hasSessionAndSessionId = R.allPass([
    R.compose(R.complement(R.isNil), R.view(sessionLens)),
    R.compose(
        R.complement(R.isNil),
        R.view(
            R.compose(sessionLens, sessionIdLens)
        )
    )
])


// getOrCreateSession :: context a => Promise() => UserSession
const getOrCreateSession = R.ifElse(
    R.compose(hasSessionAndSessionId, viewRequest),
    sessionRight,
    sessionLeft
)

// Get or create a UserSession, set the session_id for the current request & return the UserSession
const setSession = (context)=> setUser(context)
    .then(getOrCreateSession)
    .then((session)=> {
        context.request.session.session_id = session.id
        // context.request.session.save
        // return session

        return new Promise((resolve, reject)=> {
            context.request.session.save(
                (err)=> err ? reject(err) : resolve(session)
            )
        })
    })


// module.exports = setSession
module.exports = {
    setUser,
    setSession
}