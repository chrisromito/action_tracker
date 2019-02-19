const moment = require('moment');
const R = require('ramda');
import Vue from 'vue';
import Vuex from 'vuex';

import { TotalExpenditure } from './common/bmr';

Vue.use(Vuex)


const today = moment().toDate()


/**
 * @exports AppStore {Vuex.Store}
 * @property {Object} state: The store state
 */
export const AppStore = new Vuex.Store({

    state: {
        dateRange: {
            start: today,
            end: moment().add(30, 'days').toDate()
        },

        calorie_intake: 2000,

        userStats: {
            height: 175, // height in centimeters
            weight: 69, // BW in lbs
            age: 18,  // Age in years
            is_male: true,  // sex (default: male)
            pal: 1.53
        }
    },

    getters: {
        rangeScope: (state)=> ()=> {
            return R.tryCatch(
                getRangeScope,
                ()=> []
            )(state)
        },
        rangeScopeNodes: (state, getters)=> {
            return ()=> getters.rangeScope().map((i)=> new RangeNode.map(i))
        }
    },

    mutations: {
        setDateRange (state, payload) {
            state.dateRange = {
                start: today,
                end: moment(payload.end).toDate()
            }
        },

        setIntake (state, payload) {
            state.calorie_intake = !isNaN(Number(payload)) ? Number(payload) : 2000
        },

        setStats (state, payload) {
            const newStats = R.mergeDeepRight(state.userStats, payload)
            state.stats = newStats
        }
    },

    actions: {

        setDateRange (context) {
            /**
             * @param context {Object}: An object w/ 'commit' method
             * @returns {void}
             */
            context.commit('setDateRange')
        }
    }
})



const deltaDays = (start, end)=> Math.abs(
    moment(start).diff(moment(end), 'days')
)

const relativeDate = (start_date)=> (index)=> (
    moment(start_date).add(index, 'days').toDate()
)

const userStatsProp = R.prop('stats')

const dateRangeProp = R.prop('dateRange')
const endDate = R.compose(R.prop('end'), dateRangeProp)
const startDate = R.compose(R.prop('start'), dateRangeProp)

const isNumber = R.compose(R.equals('Number'), R.type)

const repeatN = (fn, n)=> {
    if (!isNumber(n)) {
        throw new TypeError(`
            repeatN expected 'n' to be a Number. 
            Received type ${R.type(n)} instead.
            The value of "n": ${n}
        `)
    }
    let accum = []
    let i = 0
    while (i < n) {
        accum.push(fn())
        i++
    }
    return accum
}



/**
 * @class RangeNode: A functor that facilitates rangeScope (see below)
 * @param intake {Number}: Calorie intake
 * @param expenditure {Number}: Calorie expenditure
 * @param date {Date}: Date this instance is associated w/
 * @param userStats {Object}
 */
export class RangeNode {
    constructor(intake, expenditure, date, userStats) {
        this.intake = intake
        this.expenditure = expenditure
        this.date = date
        this.userStats = userStats
        this.data = userStats
    }

    static map(obj) {
        return new RangeNode(
            obj.intake,
            obj.expenditure,
            obj.date,
            obj.userStats
        )
    }
}


const getRangeScope = (scope)=> {
    try {
        const calorie_intake = scope.calorie_intake
        const start_date = startDate(scope)
        const end_date = endDate(scope)
        const statsProp = userStatsProp(scope)

        if (!statsProp) {
            // If we don't have user stats, then
            // we can't produce results.
            // Once the child components push their
            // state up the chain, we will have user stats
            return []
        }

        const startExpenditure = new TotalExpenditure(
            statsProp.weight,
            statsProp.height,
            statsProp.age,
            statsProp.is_male,
            statsProp.pal
        )

        const calorieArr = repeatN(
            ()=> calorie_intake,
            deltaDays(start_date, end_date)
        )
        // Cache the start_date moment
        const rangeDate = relativeDate(start_date)

        return startExpenditure.flatMap(calorieArr)
            .map((item, index)=> ({
                    intake: calorieArr[index],
                    expenditure: item.getData(),
                    date: rangeDate(index),
                    userStats: item
            }))
            
    } catch(err) {
        console.warn(err)
        throw(err)
    }
}
