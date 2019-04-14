/**
 * @module service - Provide services/interfaces for Users, UserSessions, & Accounts
 */
const R = require('ramda')
const { Future } = require('ramda-fantasy')
const { checkSchema } = require('express-validator/check')
const { User, Account, UserSession } = require('../../models/index')
const { pToFuture } = require('../../utils/future_promise_interop')
const SessionMonad = require('./interfaces')



/**
 * Services
 *=====================================================================================*/

const UserService = (request)=> ({
    /**
     * @method createAccount - Creates a UserAccount based on the data provided in request.body
     * NOTE: This assumes the request body has been validated & sanitized
     * @returns {Future[UserSession]}
     */
    createAccount: ()=> CreateUserFuture(request.body),

    /**
     * @method getUser - Get the current user based on the request
     * @returns {Future <(null|Error), User>} Future that resolves with a User and rejects w/ null or an Error
     */
    getAccount: ()=> Future((reject, resolve)=> 
        Account.findById(
            SessionMonad(request).value().accountId
        )
        .then((user)=> user ? resolve(user) : reject(user))
        .catch(reject)
    ),

    login: (account, password)=> Future((reject, resolve)=>
        account.passwordValid(password)
            .then((valid)=> valid ? resolve(account) : reject(account))
            .catch(reject)
    ).map((arg)=> {
        // Map the account ID to the request session
        // so calling 'fork(errHandler, successHandler)' on this Future
        // Auto-magically updates the request

        SessionMonad(request).map({ accountId: account._id })
    })
})



/**
 * @function UserSessionService {Functor}
 * @method createSession - create a new UserSession for the given User.
 * NOTE: This deactivates other UserSessions for this User
 * @param {User} user
 * @returns {Future[(Error | UserSession)]}
 * 
 * @method updateUserActiveStatus - Update the 'active' status of a single UserStatus instance
 * @param {User} user
 * @param {Boolean} active
 * @returns {Future[(Error | UserSession)]}
 */
const UserSessionService = (request)=> ({
    createSession: (user)=> Future((reject, resolve)=> 
        // Deactivate existing User Sessions, then create the new one
        UserSession.updateMany(
            { user: user._id },
            { active: false}
        )
        .save()
        .then(()=> new UserSession({
                user: user._id,
                active: true,
                ip_address: getHeaderIp(request),
                device: req.headers ? req.headers['user-agent'] : null
            }).save())
        .then(resolve)
        .catch(reject)
    ),


    /**
     * FIXME: updateUserActiveStatus must update the user's session to 'is_active'
     */
    updateUserActiveStatus: (user, is_active)=> pToFuture(''),

})



/**
 * Utils
 */

const getHeaderIp = R.compose(
    (ip_address)=> String(ip_address).split(',')[0].trim(),
    (req)=> req.headers && req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for']
        : req.connection.remoteAddress
)




const existsAndLengthIsOneToTwoFifty_ = {
    exists: true,
    isLength: {
        options: {
            min: 1,
            max: 250
        }
    }
}

/**
 * @exports SignUpSchema - express-validator schema for creating a new User
 * 
 * @example
 * >>> const { validationResult } = require('express-validator/check')
 * >>> app.post('/user/', [SignUpSchema, (req, res, next)=> {
 * ...     const signUpErrors = validationResult(req)
 * ... }])
 */
const SignUpSchema = checkSchema({
    password1: {
        exists: true
    },

    password2: {
        exists: true,
        isLength: {
            errorMessage: 'Password must be at least 6 characters',
            options: {
                min: 6,
                max: 250
            }
        },
        custom: {
            options: (value, { request })=> value === req.body.password1
        }
    },

    username: {
        exists: true,
        isEmail: true
    },

    first_name: existsAndLengthIsOneToTwoFifty_,
    last_name: existsAndLengthIsOneToTwoFifty_
})


// Accounts
const createAccount = (accountData)=> pToFuture(
    new Account(accountData)
        .save())

const createUser = (account)=> pToFuture(
    new User({ account: account._id, active: true })
        .save())

const createUserSession = (user, data=null)=> pToFuture(
    new UserSession(
        Object.assign({}, data || {}, { user: user._id, active: true })
    ).save())


const CreateUserFuture = (accountData)=> createAccount(accountData)
    .chain(createUser)
    .chain(createUserSession)

/**
 * @function getUserSessionsForAccount - Helper function for
 * getting a user's sessions based on an account
 * @returns {Query} - Does NOT execute the query for you,
 * since you'll likely want to filter/populate further
 */
const getUserSessionsForAccount = (accountId)=> UserSession.find({})
    .where('user')
    .exists()
    .where('user.account', accountId)
    .populate({
        path: 'user',
        model: 'User',
        populate: {
            path: 'account',
            model: 'Account'
        }
    })



module.exports = {
    SignUpSchema,
    CreateUserFuture,
    UserService,
    UserSessionService,
    getUserSessionsForAccount
}
