const R = require('ramda')
const Maybe = require('maybe')
const toPromise = require('../utils/to_promise').toPromise

const {
    Account,
    Action,
    User,
    UserSession,
    PageView
} = require('../models/index')

const {
    toJson,
    tryOrNull,
    viewRequest,
    sessionLens,
    sessionIdLens,
    userIdLens,
    getUserId,
    getRequestUser,
    DateRangeFilter
} = require('./common')
const Io = require('../../shared/functional_types/io')


/**
 * URL Filter Params:
 * active {Boolean}
 * url {String}
 * created_start {Date|Number}
 * created_end {Date|Number}
 */
// const activeFilter = setIfQuery(R.lensPath(['active']))

const activeLens = R.lensPath(['active'])
const activeFilter = (query)=> (obj)=> R.view(activeLens, query) ? R.over(
        activeLens,
        R.either(
            Boolean,
            R.equals('true', R.__)
        ),
        query
    ) :
    obj

const urlLens = R.lensPath(['url'])
const urlFilter = (query)=> (obj)=> R.view(urlLens, query) ? R.over(
        urlLens,
        R.always(R.view(urlLens, query)),
        obj
    ) :
    obj

const createdFilter = (query)=> (obj)=> DateRangeFilter('created', query, obj)


const setPageViewFilters = (query, obj)=> Io.lift(obj)
    .map(activeFilter(query))
    .map(urlFilter(query))
    .map(createdFilter(query))

const normalizeId = R.over(
    R.lensPath(['id']),
    R.view(R.lensPath(['_id']))
)

const serializeModels = R.map(normalizeId)


/**
 * PageView Controller methods
 *=========================================*/

const PageViewCharts = (req, res)=> {
    const data = {}
    return res.render('page_view_demo/page_view_demo.html', {
        data
    })
}



/**
 * PageView REST API Controller methods
 */
const PageViewList = (req, res)=> {
    const filterObj = setPageViewFilters(req.query, {}).run()

    return PageView.find(filterObj, null)
        .populate('children')
        .populate({
            path: 'userSession',
            populate: { path: 'user', select: 'account active updated created' }
        })
        .exec()
        .then(R.pipe(
            serializeModels,
            (pv)=> res.json(pv)
        ))
}


const defaultToNull = R.defaultTo(null)

const PageViewPost = (req, res)=> new PageView({
    userSession: defaultToNull(req.session.session_id),
    parent: defaultToNull(req.body.parent),
    url: defaultToNull(req.body.url),
    active: true,
    meta: defaultToNull(req.body.meta),
    created: Date.now(),
    updated: Date.now()
}).save()
    .then((pv)=> res.json(
        normalizeId(pv.toObject())
    ))



module.exports = {
    PageViewCharts,
    PageViewList,
    PageViewPost
}