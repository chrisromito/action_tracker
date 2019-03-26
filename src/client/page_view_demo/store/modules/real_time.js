import * as R from 'ramda'
import { Maybe } from 'ramda-fantasy'
import { activeFilter, deltaSeconds } from '../../shared'
import * as Io from '../../../../shared/functional_types/io'
import { uuid } from '../../../common/utils'

/**
 * @typedef PageView : An instance of a user viewing a page
 * @property {Object} userSession - User Session gives us the ID for a
 * given user, their 'active' status (whether they're still using the app), etc.
 * @property {(String|null)} parent - ID for the PageView that was created for the
 * same userSession, but happened before this PageView (ie. the last page the user viewed)
 * @property {String} url - Activate page URL
 * @property {Boolean} active - True if the user is currently viewing a page
 * @property {Object} meta - Meta Data (may not be needed here)
 * @property {Date} created
 * @property {Date} updated
 */

const State = {
    pageViews: [],
    lastRequest: Date.now(),
    isLoading: false,
    _pvRequest: null
}

export const loadingLens = R.lensPath(['isLoading'])
export const pageViewLens = R.lensPath(['pageViews'])
export const lastRequestLens = R.lensPath(['lastRequest'])
export const urlLens = R.lensPath(['url'])
export const countLens = R.lensPath(['count'])
export const percentLens = R.lensPath(['percent'])

const groupByUrl = R.groupBy(R.view(urlLens))

const urlGroupsToPairs = R.compose(R.toPairs, groupByUrl)

export const groupSpec = (data, url_data_pair)=> {
    const count = R.length(R.prop(1, url_data_pair))
    return {
        uuid: uuid(),
        url: R.prop(0, url_data_pair),
        count: R.length(R.prop(1, url_data_pair)),
        percent: count / data.length
    }
}


const activePerPage = (page_views)=> Io.lift(page_views)
    .chain(
        // Group the Page Views by URL, transpose key/values to pairs, & lift into the groupSpec
        (pv)=> Io.lift(pv)
                .map(urlGroupsToPairs)
                .map(
                    R.map(R.curry(groupSpec)(pv))
                )
    ).map(
        // Sort descending by 'count'
        R.sort(R.descend(R.view(countLens)))
    )

//-- Getters

const Getters = {
    activePageViews: (state)=> {
        return R.view(pageViewLens, state)
    },

    activePerPage: (state, getters)=> {
        return activePerPage(
            getters.activePageViews
        ).run()
    },

    secondsSinceLastRequest: (state)=> {
        return Maybe(R.view(lastRequestLens, state))
                .map(deltaSeconds)
    }
}



//-- Mutations

const Mutations = {
    loading: (state, status)=> {
        /**
         * @method loading - Set `isLoading` on `state`
         * @param {Boolean} status
         * @returns {void}
         */
        state.isLoading = status
    },

    setLastRequest: (state)=> {
        state.lastRequest = Date.now()
    },

    setPageViews: (state, page_views)=> {
        /**
         * @method setPageViews
         * @param {Object} state
         * @param {Object[]} page_views
         * @returns {void}
         */
        state.pageViews = page_views
    },

    setPvRequest: (state, fn)=> {
        state._pvRequest = fn
    }
}


//-- Actions


const getPageViews = ()=> fetch('/api/page_view/?active=true').then((pv)=> pv.json())

const Actions = {
    refresh({ commit, state}) {
        // Don't fire another request if we're still loading.
        // just return the state
        const isLoading = state.loading
        commit('loading', true)
        commit('setLastRequest')

        const fn = isLoading ? state._pvRequest : getPageViews()

        commit('setPvRequest', fn)

        fn.then((pv)=> {
            // commit.setPageViews(pv)
            // commit.loading(false)
            commit('setPageViews', pv)
            commit('loading', false)
        })
    }
}


export default {
    namespaced: true,
    state: State,
    getters: Getters,
    actions: Actions,
    mutations: Mutations
}

