import './app.scss'

import Vue from 'vue';
// App
// import { AppStore } from './app.store';
// import { ChartComponent, ChartTemplate } from '../outcomes_chart/chart.component';
// import { PredictorsComponent, PredictorsTemplate } from '../predictors/predictors.component';

import { RealTimeComponent } from './components/real_time/real_time.component';


export const app = new Vue({
    el:'#app',
    // store: AppStore,
    components: {
        'real-time': RealTimeComponent
    }
})