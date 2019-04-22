/**
 * @module service - Provide services/interfaces for PageViews & Pages.
 */
const { URL } = require('url')
const R = require('ramda')
const { Future } = require('ramda-fantasy')
const { Page, PageView, Domain } = require('../../models')
const SessionMonad = require('../user/interfaces')


const ofUrl = (urlString) => new URL(urlString)



/**
 * @function liftRequest - Lift a request into a service instance
 * @param {Function} service - A unary monadic interface who's methods
 * always return Futures
 * @param {R.lens} urlLens - The 'getter'.  Determines how the URL path
 * is obtained from the request instance
 * @param {express.Request} request - Used to get the URL and build a SessionMonad
 * @returns {Object[Function]}
 */
const liftRequest = R.curry((service, urlLens, request) => {
    const url = R.compose(ofUrl, R.view(urlLens))(request)
    const sessionMonad = SessionMonad(request)

    return service({ url, sessionMonad })
})


/**
 * @function PageService - Page related business logic
 * @param {Object} context
 * @property {URL} url - A URL instance
 * @property {SessionMonad} sessionMonad - sessionMonad bound to a request instance
 * @returns {Object[Function]} Returns an Object of variadic functions
 */
const PageService = ({ url, sessionMonad }) => ({
    getDomain: () => Future((reject, resolve) =>
        Domain.find()
            .where('client', sessionMonad.value().clientId)
            .or([
                { 'url.host': url.host },
                { 'url.hostname': url.hostname }
            ])
            .exec()
            .then((domains) => domains[0])
            .then(resolve)
            .catch(reject)
    ),

    /**
     * @method getPage
     * Since getDomain() validates the URL, and ensures
     * it's valid for the client, we just need to grab the clientId from the domain
     * to pass that validity check down the chain.
     */
    getPage: () => PageService({ url, sessionMonad })
        .getDomain()
        .chain((domain) =>
            Future((reject, resolve) =>
                Page.find()
                    .where('client', domain.client)
                    .where('url.pathname', url.pathname)
                    .or([
                        { 'url.host': url.host },
                        { 'url.hostname': url.hostname }
                    ])
                    .exec()
                    .then((pages) => pages[0])
                    .then(resolve)
                    .catch(reject)
            )
        ),

    /**
     * @method getOrCreatePage
     * Note that this grabs the clientId from the Domain instead of the request session
     * since we're calling chainReject().
     * We're essentially trying to catch errors where we couldn't find the page,
     * but we still want to propagate errors with the Domain.
     * 
     * The 'client: domain.client' facilitates this, since that will throw a TypeError or ValueError
     * or something (Error/undefined/null doesn't have property 'client')
     */
    getOrCreatePage: () => PageService({ url, sessionMonad })
        .getPage()
        .chainReject((domain) =>
            Future((reject, resolve) =>
                new Page({
                    client: domain.client,

                    url: {
                        href: url.href,
                        origin: url.origin,
                        protocol: url.protocol,
                        host: url.host,
                        port: url.port,
                        pathname: url.pathname
                    }
                }).save()
                    .then(resolve)
                    .catch(reject)
            )
        )
})

PageService.liftRequest = liftRequest(PageService)


/**
 * @function PageViewService - Service Class/Function for PageViews
 * Note: This is separate from PvService_:
 * 1. For the sake of brevity
 * 2. Explicit spread params for url & SessionMonad
 * 
 * @param {Object} context
 * @property {URL} url - A URL instance
 * @property {SessionMonad} sessionMonad - sessionMonad bound to a request instance
 * @returns {Object[Function]} Returns an Object of variadic functions
 */
const PageViewService = ({ url, sessionMonad, ...kwargs }) => PvService_({ url, sessionMonad, ...kwargs })


PageViewService.liftRequest = liftRequest(PageViewService)



const PvService_ = (context) => ({

    _create: (pageId, { ...pageArgs }) => Future((reject, resolve) =>
        new PageView({
            ...pageArgs,
            userSession: context.sessionMonad.value().sessionId,
            page: pageId
        }).save()
            .then(resolve)
            .catch(reject)
    ),

    // Create:: PvService_[U, SM] -> Future[e v]
    // Gets or creates the Page, based on 'url' {URL}
    // & populates a new PageView using the URL and the data in the sessionMonad
    create: () => PageService(context)
        .getOrCreate()
        .chain((page) =>
            PvService_(context)
                ._create(page._id)
        ),

    createFromLast: R.curry(createFromLast)((context)),

    createFromParent: R.curry(createFromParent)(context),

    createSequence: (parentId = null) => PageService(context)
        .getOrCreate()
        .chain((page) =>
            parentId
                ? PvService_(context).createFromParent(parentId, page._id)
                : PvService_(context).createFromLast(page._id)
        ),

    getLastPageView: R.curry(getLastPageView)(context)
})


/*
 * Helper Functions
 */

const createFromParent = (context, parentId, pageId) =>
    Future((reject, resolve) =>
        PageView.findById(parentId)
            .exec()
            .then(resolve)
            .catch(reject)
    ).chain((pv) =>
        PvService_(context)
            ._create(pageId, {
                parent: pv._id,
                sequence: pv.sequence + 1
            })
    )


const createFromLast = (context, pageId) => getLastPageView(context, pageId)
    .chain((pv) =>
        PvService_(context)
            ._create(pageId, {
                parent: pv ? pv._id : null,
                sequence: pv ? pv.sequence + 1 : 0,
            })
    )


const getLastPageView = (context, pageId) =>
    Future((reject, resolve) =>
        PageView.find()
            .where('userSession', context.sessionMonad.value().sessionId)
            .where('page', pageId)
            .sort({
                created: -1,
                updated: -1
            })
            .limit(1)
            .exec()
            .then(resolve)
            .catch(reject)
    )


module.exports = {
    ofUrl,
    PageService,
    PageViewService
}