/** @module login - Provide configurable middleware that ensures
 * the current user is logged in
 * @exports isLoggedIn:: options {Object} => {Function}:: req, res, next
 */


/** @function isLoggedIn : Checks the session & 
 * redirects to '/login/' if the user is not logged in
 * 
 * @param {Object} options: Configuration options
 *      login_url {String}: The login URL to redirect to
 *              This defaults to '/login/'
 * @returns {Function:: req, res, next}
 */
const isLoggedIn = (options)=> {
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
