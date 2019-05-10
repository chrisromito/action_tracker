// import * as R from 'ramda';
// import * as Maybe from 'maybe';
const R = require('ramda')
const Maybe = require('maybe')
const { toPromise } = require('../../utils/to_promise')


const {
    toJson,
    socketContext,
    viewRequest,
    getRequestUser,
    DateRangeFilter
} = require('../common/common')

const {
    Account,
    Action,
    User,
    UserSession
} = require('../../models/index')

const {
    ActionInterface,
    EventActionInterface,
    UserInterface
} = require('../../../shared/interfaces/index')
const Io = require('../../../shared/functional_types/io')

const { setSession } = require('../user/user.session')


/**
 * @constant onOpen :: context {socketContext} => Promise => UserSession {JSON}
 * NOTE: This can either be used when a socket connection is opened,
 * or as middleware to ensure users always have a session set
 */
const onOpen = (context)=> setSession(context)
    .then((session)=> session.toObject())
    .then(toJson)


/**
 * @constant onClose :: context {socketContext} => Promise => User
 */
const onClose = (context)=> toPromise(
        (cb)=> User.findOneAndUpdate(
            { id: getUserId(viewRequest(context)).value() },
            { active: false},
            cb
        )
    ).then((user)=> user.toObject())
    .then(toJson)


/**
 * @constant createAction :: context {socketContext}, action {Object} => Action {JSON}
 * Create an Action instance.  This expects a 'user' instance to exist on request.session
 */

const createAction = (context, action)=> onOpen(context)
    .then(()=> {
        action.user = getRequestUser(context)
        return new Action(action)
            .save()
            .then((a)=> a.toObject())
    }).then(toJson)
    .catch((e)=> {
        console.log('Error!')
        console.log(e.stack)
        throw e
    })


/*
 *
 *  REST Interfaces
 *-------------------------------------------------*/


//-- Filter Builder Helpers
const viewLens = (lens, query)=> R.view(lens, query)

const actionTypeFilter = R.curry((query, obj)=> {
    const typeLens = R.lensPath(['actionType'])
    const param = viewLens(typeLens, query)
    return param ? R.over(
        typeLens,
        R.always(R.view(typeLens, query)),
        obj
    ) : obj
})


const timeStampFilter = R.curry((query, obj)=> DateRangeFilter('timestamp', query, obj))


const targetNameFilter = R.curry(
    (query, obj)=> R.has('target_name', query) ?
        R.over(
            R.lensPath(['target.name']),
            R.always(R.prop('target_name', query)),
            obj
        ) :
        obj
)

const userIdFilter = R.curry(
    (query, obj)=> R.has('user', query) ?
        R.over(
            R.lensPath(['user._id']),
            R.always(R.prop('user', query)),
            obj
        ) :
        obj
)



//-- Serialization
const parse = R.pipe(JSON.stringify, JSON.parse)

const liftUser = (o)=> Maybe(o).isJust() ? new UserInterface(o).toObject(true) : null

const liftAction = (a)=> R.over(
    R.lensPath('user'),
    liftUser,
    ActionInterface.of(a)
)

const serializeActions = R.pipe(
    parse,
    R.map(liftAction),
    JSON.stringify
)


/**
 * @const actionList - Handle RESTful GET requests for many actions
 */

const setActionFilters = (query, obj)=> Io.lift(obj)
    .map(actionTypeFilter(query))
    .map(timeStampFilter(query))
    .map(targetNameFilter(query))
    .map(userIdFilter(query))


const actionList = (req, res)=> {
    const queries = req.query

    const pageNumber = queries.page || 1
    const lowerLimit = (pageNumber - 1) * 100
    const upperLimit = pageNumber * 100
    const filterObj = setActionFilters(queries, {}).run()

    return Action.find(filterObj, null, { sort: { timestamp: -1 } })
        .skip(lowerLimit)
        .limit(upperLimit)
        .populate('user')
        .exec()
        .then(R.pipe(
            serializeActions,
            (l)=> res.send(l)
        ))
}


module.exports = {
    socketContext,
    onOpen,
    onClose,
    createAction,
    actionList
}