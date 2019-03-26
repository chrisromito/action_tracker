import Vue from 'vue'
import Vuex from 'vuex'
import real_time from './modules/real_time'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        real_time
    },
    strict: debug
})