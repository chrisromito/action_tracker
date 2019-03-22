/** @module login - Provide configurable middleware that ensures
 * the current user is logged in
 * @exports isLoggedIn:: options {Object} => {Function}:: req, res, next
 */
const requestContext = require('../controllers/action').socketContext
const { setSession, setUser } = require('../controllers/user.session')

const defaultOptions = {
    login_url: '/user/login',
    enforceLogin: false
}

const isLoggedIn = (options=defaultOptions)=> {
    const settings = Object.assign({}, defaultOptions, options)

    return (req, res, next)=> {
        const isNotLoggedIn = (!req.session.user || !req.cookies.user_sid)
        const enforceLogin = settings.enforceLogin
        console.log(`loginMiddleware: isNotLoggedIn: ${isNotLoggedIn}`)
        if (isNotLoggedIn && enforceLogin) {
            res.redirect(settings.login_url)
            return next()
        } else {
            const context = requestContext(undefined, req)
            return setSession(context).then((context)=> next())
        }
    }
}




/**
 * @function isLoggedIn : Checks the session & 
 * redirects to '/login/' if the user is not logged in
 * 
 * @param {Object} options: Configuration options
 *      login_url {String}: The login URL to redirect to
 *              This defaults to '/login/'
 * @returns {Function:: req, res, next}
 */
const isLoggedIn_ = (options)=> {
    const settings = Object.assign({}, {login_url: '/login/'}, options)

    return (req, res, next)=> {
        if (!req.session.user || !req.cookies.user_sid) {
            res.redirect(settings.login_url)
        } else {
            next()
        }
    }
}

module.exports = isLoggedIn
