
const Maybe = require('maybe')
const R = require('ramda')
const serializeModel = require('../../utils/transform_fields').serializeModel


const toJson = (model)=> JSON.stringify(serializeModel()(model))

const tryOrNull = (fn)=> R.tryCatch(fn, R.always(null))

/** 
 * @constant socketContext :: Wrap a websocket and request in an Object
 * this is used to simplify passing websocket context between functions
 *
 * @param {WebSocket} ws
 * @param {Request} req
 * @returns {Object}
 */
const socketContext = (ws, req)=> ({ socket: ws, request: req})


const requestLens = R.lensPath(['request'])

const socketLens = R.lensPath(['socket'])

const viewRequest = R.view(requestLens)

//-- Session specific lenses
const sessionLens = R.lensPath(['session'])

const sessionIdLens = R.lensPath(['session_id'])

const userIdLens = R.lensPath(['user_id'])

const getUserId = R.compose(
    Maybe,
    tryOrNull(
        R.view(
            R.compose(sessionLens, userIdLens)
        )
    )
)



const getRequestUser = tryOrNull((context)=> R.view(
    // R.compose(requestLens, sessionLens, R.lensPath(['user', 'id'])),
    R.compose(requestLens, sessionLens, R.lensPath(['user'])),
    context
))



/**
 * Utils for building Model/Query filters
 * from request query parameters
 *----------------------------------------------*/

const viewLens = (lens, query)=> R.view(lens, query)


/**
 * @const DateRangeFilter :: name {String}, query {Object}, obj {Object}=> queryFilter {Object}
 * Note: `name` must correspond with the field name on the Model,
 * and the upper (latest) and lower (earliest) constraints are referenced
 * via the `${name}_end` and `${name}_start` keys (respectively) in the `query` object
 *
 * Note: Dates must be NUMBERS (`parseInt(val)` must return a Number, anyway)
 * 
 * @example
 * >>> var myUser = await User.findOne({ id: 'foo'}).exec()
 * >>> myUser.created // => { Date }
 * >>> DateRangeFilter('created', { created_start: Date.now() - 1000000, created_end: Date.now() - 99}, {})
 * //... {
 *          created: {
 *              $gt: // {Date} set to Date.now() - 1000000
 *              $lt: // {Date} set to Date.now() - 99
 *          }
 *      }
 * 
 */
const DateRangeFilter = (name, query, obj)=> {
    const startLens = R.lensPath([`${name}_start`])
    const startParam = viewLens(startLens, query)
    const setStartParam = R.ifElse(
        R.always(startParam),
        R.over(
            R.lensPath([name, '$gt']),
            ()=> new Date(parseInt(startParam))
        ),
        R.identity
    )

    const endLens = R.lensPath([`${name}_end`])
    const endParam = viewLens(endLens, query)
    const setEndParam = R.ifElse(
        R.always(endParam),
        R.over(
            R.lensPath([name, '$lt']),
            ()=> new Date(parseInt(endParam))
        ),
        R.identity
    )

    const setFilterProp = R.pipe(
        R.ifElse(
            R.always(
                R.or(startParam, endParam)
            ),
            R.over(R.lensPath([name]), R.always({})),
            R.identity
        ),
        setStartParam,
        setEndParam
    )

    return setFilterProp(obj)
}





module.exports = {
    toJson,
    tryOrNull,
    socketContext,
    requestLens,
    socketLens,
    viewRequest,
    sessionLens,
    sessionIdLens,
    userIdLens,
    getUserId,
    getRequestUser,

    // Filter utils
    DateRangeFilter
}