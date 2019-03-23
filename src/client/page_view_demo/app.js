import './app.scss'

import Vue from 'vue'
// App
import store from './store'
// import { ChartComponent, ChartTemplate } from '../outcomes_chart/chart.component';
// import { PredictorsComponent, PredictorsTemplate } from '../predictors/predictors.component';

import { RealTimeChart } from './components/real_time/real_time.component'
import { ActivePagesComponent } from './components/active_pages/active_pages.component'

export const app = new Vue({
    store,
    el:'#app',
    components: {
        'real-time': RealTimeChart,
        'active-pages': ActivePagesComponent
    }
})