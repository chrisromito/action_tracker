const R = require('ramda')
const { Future } = require('ramda-fantasy')

const { PageView, Domain } = require('../../models/index')
const SessionMonad = require('../user/interfaces')
const { PageService, PageViewService } = require('../page_view/service')

const { fToPromise } = require('../../utils/future_promise_interop')
const { socketContext, DateRangeFilter } = require('../common/common')
const { setUser, setSession } = require('../user/user.session')
const Io = require('../../../shared/functional_types/io')


/**
 * URL Filter Params:
 * active {Boolean}
 * url {String}
 * created_start {Date|Number}
 * created_end {Date|Number}
 */
// const activeFilter = setIfQuery(R.lensPath(['active']))

const activeLens = R.lensPath(['active'])
const activeFilter = (query) => (obj) => R.view(activeLens, query) ? R.over(
    activeLens,
    R.either(
        Boolean,
        R.equals('true', R.__)
    ),
    query
) :
    obj

const urlLens = R.lensPath(['url'])
const urlFilter = (query) => (obj) => R.view(urlLens, query) ? R.over(
    urlLens,
    R.always(R.view(urlLens, query)),
    obj
) :
    obj

const createdFilter = (query) => (obj) => DateRangeFilter('created', query, obj)


const setPageViewFilters = (query, obj) => Io.lift(obj)
    .map(activeFilter(query))
    .map(urlFilter(query))
    .map(createdFilter(query))

const normalizeId = R.over(
    R.lensPath(['id']),
    R.view(R.lensPath(['_id']))
)

const serializeModels = R.map(normalizeId)


//-- Common functions

const defaultToNull = R.defaultTo(null)

const getPopulatedPageView = (pageViewId)=> PageView.find({ id: pageViewId })
    .populate('page')
    .populate('children')
    .populate({
        path: 'userSession',
        populate: {
            path: 'user',
            select: 'account active updated created'
        }
    })
    .limit(1)
    .exec()




/**
 * PageView Controller methods
 *=========================================*/

const PageViewCharts = (req, res) => setSession(socketContext({}, req))
    .then(() => res.render('page_view_demo/page_view_demo.html', {
        data: {}
    }))



/**
 * PageView REST(ish) API Controller methods
 */
const PageViewList = (req, res) => {
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
            (pv) => res.json(pv)
        ))
}


const PageViewDetail = (req, res)=> getPopulatedPageView(req.params.pageViewId)
    .then((pv)=> normalizeId(pv.toObject()))
    .then((pv)=> res.json(pv))


/**
 * @func PageViewPost - Handles creating a new Page View instance & creates a new Page if needed.
 * Returns a deeply populated PageView instance
 */
const PageViewPost = (req, res)=> {
    const meta = defaultToNull(req.body.meta)
    const parent = defaultToNull(req.body.parent)
    const kwargs = { meta, parent }
    
    const service = PageViewService.ofRequest(R.lensPath(['body', 'url']), req)
    const pageView = parent
        ? service.createSequence(parent, kwargs)
        : service.create(kwargs)

    return fToPromise(pageView)
        .then((pv)=> getPopulatedPageView(pv._id))
        .then((pv)=> normalizeId(pv.toObject()))
        .then((pv)=> res.json(pv))
}




module.exports = {
    PageViewCharts,
    PageViewList,
    PageViewDetail,
    PageViewPost
}
