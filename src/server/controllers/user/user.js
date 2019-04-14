/**
 * @module
 * @exports
 *    userList : JSON, paginated view for Users.
 *        - Filter by active, sort by, created, & updated
 *    userDetail : JSON view for a single user.
 *        - Includes 50 most recent sessions for this user 
 *     
 *    userCreate : Creates a new user (based on POST'd form)
 *  //-- Login Workflows
 *    userLoginGet : Renders the form for the user login page
 *    userLoginPost : Validates user submitted credentials (based on POST'd form w/ username & email)
 *      
 */
const R = require('ramda')
const Maybe = require('maybe')

const { check, validationResult } = require('express-validator/check')
const { serializeModel } = require('../../utils/transform_fields')

const {
    Account,
    Action,
    User,
    UserSession
} = require('../../models/index')

const { UserInterface } = require('../../../shared/interfaces/index')

const { DateRangeFilter } = require('./common')


/**
 *  Filter helpers
 *----------------------------------------
 *----------------------------------------*/

const viewLens = (lens, query)=> R.view(lens, query)

const activeFilter = (query, obj)=> {
    const activeLens = R.lensPath(['active'])
    const param = viewLens(activeLens, query)
    return param ? R.over(
        activeLens,
        R.ifElse(
            R.equals('true'),
            R.T,
            R.F
        ),
        obj
    ) : obj
}


const updatedFilter = (query, obj)=> DateRangeFilter('updated', query, obj)

const createdFilter = (query, obj)=> DateRangeFilter('created', query, obj)


const setUserFilters = (query, obj)=>{
    const filterList = [activeFilter, updatedFilter, createdFilter]
        .map(R.curry)
        .map((fn)=> fn(query))
    const filterFn = R.compose(...filterList)
    return filterFn(obj)
}


//-- Serialization
const parse = R.pipe(JSON.stringify, JSON.parse)

const liftUser = (o)=> new UserInterface(o).toObject(true)

const liftUserToJson = R.pipe(
    parse,
    liftUser,
    JSON.stringify
)

const liftUsersToJson = R.pipe(
    parse,
    R.map(liftUser),
    JSON.stringify
)


/**
 *  View Controllers
 *----------------------------------------
 *----------------------------------------*/


// All users
exports.userList = (req, res)=> {
    const queries = req.query

    const pageNumber = queries.page || 1
    const lowerLimit = (pageNumber - 1) * 100
    const upperLimit = pageNumber * 100
    const filterObj = setUserFilters(queries, {})

    return User.find(filterObj, null, { sort: { created: -1 } })
        .skip(lowerLimit)
        .limit(upperLimit)
        .populate('account')
        .populate({
            path: 'sessions',
            select: 'active ip_address device updated created', 
            options: {
                sort: {
                    updated: -1  // Sort descending on 'updated' field
                },
                limit: 1
            }
        }).exec()
        .then(R.pipe(
            liftUsersToJson,
            (l)=> res.send(l)
        ))
}



/**
    var testUserQuery = User.find({}, null, { sort: { created: -1 } }
        ).skip(0
        ).limit(5
        ).populate('account'
        ).populate({
            path: 'sessions',
            select: 'active ip_address device updated created', 
            options: {
                sort: {
                    updated: -1  // Sort descending on 'updated' field
                },
                limit: 1
            }
        }).exec()
*/




// User detail - Get user by ID
exports.userDetail = (req, res)=> User.findById(req.params.userId)
    .populate('account')
    .populate({
        path: 'sessions',
        select: 'active ip_address device updated created', 
        options: {
            sort: {
                updated: -1  // Sort descending on 'updated' field
            },
            limit: 50
        }
    }).exec()
    .then(R.pipe(
        liftUserToJson,
        (user)=> res.send(user)
    ))


// Update user
exports.userUpdate = (req, res)=> {

}

// Delete user
exports.userDelete = (req, res)=> {

}




//-- Login & write operations
//------------------------------------
//----------------------------------------


/**
 * @method userLoginGet : Renders the login page
 */
exports.userLoginGet = (req, res)=> {
    const msg = 'userLoginGet - Nunjucks message =D'
    return res.render('account/login.html', {
        message: msg
    })
}


/**
 * @method userLoginPost : Validates submitted credentials (username & email),
 * & adds username, user ID, etc. to the requested session
 */
exports.userLoginPost = [
    // Form validation
    check('username')
        .isEmail(),
    check('password', 'Invalid credentials')
        .exists()
        .custom(
            (value, {req})=> User.findOne({ username: value})
                .populate('account')
                .exec()
                .then((user)=> user.passwordValid(req.body.password)
                        .then((valid)=> {
                            if (valid) {
                                req.session.user_id = user._id
                                req.session.user = user
                            }
                            return valid
                        })
                )
        ),
    //-- Request/Response
    (req, res)=> {

    }
]


/**
 * @method userSignupGet : Display the signup page
 */
exports.userSignupGet = (req, res)=> {
    return res.render('account/signup.html', {
        // csrfToken: req.csrfToken(),
        errors: []
    })
}


/**
 * @method userCreate : Validate a POSTed user-form & create a User if everything is valid
 */
exports.userSignupPost = [
    // Form validation Checks
    check('password1').exists(),
    check('password2', 'Passwords must be equal')
        .exists()
        .custom((value, {req})=> value === req.body.password1)
        .isLength({min: 6, max: 250}),
    check('username')
        .exists()
        .isEmail(),
    check('first_name')
        .exists()
        .isLength({min: 1, max: 250}),
    check('last_name')
        .exists()
        .isLength({min: 1, max: 250}),

    //-- Request/Response
    (req, res, next)=> {
        const errors = validationResult(req)
        // Render any validation errors & return
        if (!errors.isEmpty()) {
            res.render('user/signup.html', {
                errors: errors.array()
            })
            return next()
        }

        const body = req.body
        // Create the new account & link the new user to the account
        return new Account({
            username: body.username,
            password: body.password1,
            first_name: body.first_name,
            last_name: body.last_name
        }).save()
            .then(
                (acct)=> new User({ account: acct._id }).save()
                    .then((user)=> new UserSession({ user: user._id, active: true }).save()
                                        .then((user_session)=> [user, user_session]))

            )
            .then(([user, user_session])=> {
                console.log('Created user and UserSession')
                console.log(`request session: ${req.session}`)
                console.log(req.session)
                req.session.id = user_session.id
                req.session.session_id = user_session.id

                req.session.user_id = user.id
                req.session.user = user
                console.log('created an account')
                console.log(`User Session ID: ${user_session.id}`)
                console.log(`User ID: ${user.id}`)
                return user
            // }).then((user)=> next(res.send(JSON.stringify(user))))
            }).then((user)=> res.json(user))
            .catch(next)
    }
]


