/**
 * @module service - Provide services/interfaces for Users, UserSessions, & Accounts
 */
const R = require('ramda')
const { Future } = require('ramda-fantasy')
const { checkSchema } = require('express-validator/check')
const { User, Account, UserSession } = require('../../models/index')
const SessionMonad = require('./interfaces')



/**
 * @function UserService - Service/interface for User-related actions
 * 
 * @method createAccount - Creates a UserAccount based on the data provided in request.body
 * NOTE: This assumes the request body has been validated & sanitized
 * @returns {Future[{ account: Account, user: User, userSession: UserSession}]}
 * 
 * @method getAccount - Get the account of the current user based on the request
 * @returns {Future <(null|Error), Account}
 * 
 * @method getAccountByUsername
 * @returns {Future <(null|Error), Account}
 * 
 * @method login - Resolves w/ the account, rejects failed login attempts
 * @see SessionMonad
 * @param {Account} account
 * @param {String} password - Password entered by the user
 * @returns {Future <Error, Account} - Resolves with the Account, Rejects Mongoose Errors and plain Errors
 */

const UserService = (request)=> ({
    createAccount: ()=> CreateUserFuture(request.body),

    getAccount: ()=> Future((reject, resolve)=> 
        Account.findById(
            SessionMonad(request).value().accountId
        )
        .then((account)=> account ? resolve(account) : reject(account))
        .catch(reject)
    ),

    getAccountByUserName: (username)=> Future((reject, resolve)=> 
        Account.findOne({ username })
            .then((account)=> account ? resolve(account) : reject(account))
            .catch(reject)
    ),

    login: (account, password)=> Future((reject, resolve)=>
        account.passwordValid(password)
            .then((valid)=> valid ? resolve(account) : reject(new Error('Invalid credentials')))
            .catch(reject)
    )
})



/**
 * @function UserSessionService {Functor}
 * @method createSession - create a new UserSession for the given User.
 * NOTE: This deactivates other UserSessions for this User
 * @param {User} user
 * @returns {Future[(Error | UserSession)]}
 * 
 * @param {String} accountId
 * @param {Boolean} active - Is this user object still active (being used)?
 * We attempt to re-use User objects as much as possible, but ultimately
 * they are meant to be ephemeral because they are used to track the
 * activity of registered AND anonymous users.
 * Inactive means it will not be used again.
 * @returns {Future[(Error | UserSession)]}
 */
const UserSessionService = (request)=> ({
    createSession: (userId)=> Future((reject, resolve)=> 
        // Deactivate existing User Sessions, then create the new one
        UserSession.updateMany(
            { user: userId },
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

    updateUserActiveStatus: (accountId, active)=> Future((reject, resolve)=>
        getUserSessionsForAccount(accountId)
            .sort({ created: 'desc' })
            .limit(1)
            .update({ active })
            .exec()
            .then(resolve)
            .catch(reject)
    )

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
const createAccount = (accountData)=> Future((reject, resolve)=>
    new Account(accountData)
        .save()
        .then(resolve)
        .catch(reject)
)

const createUser = (context)=> Future((reject, resolve)=>
    new User({ account: context.account._id, active: true })
        .save()
        .then((user)=> ({
            account: context.account,
            user
        }))
        .catch(reject)
)

const createUserSession = (context, data=null)=> Future((reject, resolve)=>
    new UserSession(
        Object.assign({}, data || {}, { user: user._id, active: true })
    ).save()
        .then((userSession)=> ({
            account: context.account,
            user: context.user,
            userSession
        }))
        .catch(reject)
)

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
