/**
 * @module activity - Store module that holds pageViews that are used to determine
 * the TOTAL number of pageViews over a given period of time.
 * This allows us to build out a time-series line chart where we can inform
 * the end-user how many users (anonymous and registered) used their application
 * over a period of time (eg. a month)
 */
import * as R from 'ramda'
import { Maybe } from 'ramda-fantasy'
import * as Io from '../../../../shared/functional_types/io'
import { pageViewLens } from './real_time'


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
    dateRange: {
        start: null,
        end: null
    },
    isLoading: false
}



const dateRangeLens = R.lensPath(['dateRange'])
const dateStartLens = R.compose(dateRangeLens, R.lensPath(['start']))
const dateEndLens = R.compose(dateRangeLens, R.lensPath(['end']))

const userSessionLens = R.lensPath(['userSession'])
const userLens = R.compose(userSessionLens, R.lensPath(['user']))


/**
 * @func isRegistered:: pv {PageView} => {Boolean}
 */
const isRegistered = R.pipe(R.view(userLens), R.complement(R.isNil))
const registeredUsers = R.filter(isRegistered)
const anonymousUsers = R.reject(isRegistered)


//-- Getters

const Getters = {
    anonymousUserViews: (state)=> anonymousUsers(
        R.view(pageViewLens, state)
    ),

    registeredUsers: (state)=> registeredUsers(
        R.view(pageViewLens, state)
    ),

    isLoading: (state)=> state.isLoading
}



// Mutations


const Mutations = {
    loading: (state, status)=> {
        /**
         * @method loading - Set `isLoading` on `state`
         * @param {Boolean} status
         * @returns {void}
         */
        state.isLoading = status
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

    setDateRangeStart: (state, start_date)=> {
        if (validDateRange(start_date, state.dateRange.end)) {
            state.dateRange.start = start_date
        } else {
            throw RangeError(`\
            Start date must be before the end date.  \
            Expected a value less than ${state.dateRange.end}, but received ${start_date}`)
        }
    },

    setDateRangeEnd: (state, end_date)=> {
        if (validDateRange(state.dateRange.start, end_date)) {
            state.dateRange.end = end_date
        } else {
            throw RangeError(`\
            End date must be after the start date.  \
            Expected a value greater than ${state.dateRange.start}, but received ${end_date}`)
        }
    }

}


const validDateRange = (start, end)=> start < end



//-- Actions


/**
 * @func getPageViews
 * @param {Number} start_date
 * @param {Number} end_date
 * @returns {Promise<any | never>}
 */
const getPageViews = (start_date, end_date)=> fetch(`/api/page_view/?created_start=${start_date}&created_end=${end_date}`)
        .then((pv)=> pv.json())


const Actions = {
    updateDateRange({ commit, state }) {
        // TODO: Finish this
    }
}
