/**
 * @module user - Responsible for managing Sessions, with respect to the User ID, User Session ID, & Account ID
 * NOTE: This assumes that the request.session will contain the Domain ID & Client ID before this is called
 */
const R = require('ramda')
const { Future } = require('ramda-fantasy')
const { User, Account, UserSession } = require('../models/index')
const SessionMonad = require('../models/user/interfaces')
const { UserService, UserSessionService } = require('../controllers/user/service')


const execFuture = (q)=> Future((reject, resolve)=> 
    q.exec()
    .then(resolve)
    .catch(reject)
)


//-- User Middlware
const getUser = (userId)=> execFuture(User.findById(userId))

// :: req, userId -> Future[Error, User]
const getOrCreateUser = (req, userId=null)=> userId
    ? getUser(userId)
    : UserService(req).createUser()


/**
 * @func UserMiddleware - Gets or creates the User instance &
 * Sets the User Object and accountId (optional) on the request Session
 * @param {Express.Request} req: The request instance
 * @returns {Future<Error, Express.Request>} - Returns the updated request
 */
const UserMiddleWare = (req)=> getOrCreateUser(req, SessionMonad(req).value().userId)
    .map((user)=>
        SessionMonad(req).map({
            ...SessionMonad(req).value(),
            user: user,
            accountId: user.account
        })
    )



//-- User Session Middleware
const getUserSession = (userSessionId)=> execFuture(UserSession.findById(userSessionId))

// :: req, userSessionId -> Future[Error, UserSession]
const getOrCreateUserSession = (req, userSessionId=null)=> userSessionId
    ? getUserSession(userSessionId)
    : UserSessionService(req).createSession( SessionMonad(req).value().userId )


/**
 * @func UserSessionMiddleware - Sets the user, sessionId, and accountId (optional) on the
 */
const UserSessionMiddleware = (req)=> getOrCreateUserSession(req, SessionMonad(req).value().sessionId)
    .map((userSession)=>
        SessionMonad(req).map({
            sessionId: userSession._id
        })
    )



const Middleware = (req, res, next)=> UserMiddleWare(req)
    .chain((updatedReq)=> UserSessionMiddleware(updatedReq))
    .fork(next, ()=> next())

    
module.exports = Middleware
