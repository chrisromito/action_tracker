import './app_styles.scss';
const mdc = require('material-components-web');
import { MDCDialog } from '@material/dialog';

window.mdc = mdc

// Libs
const moment = require('moment');
const R = require('ramda');
import Vue from 'vue';
// App
import { cEl } from '../common/utils';
import { AppStore } from './app.store';
import { ChartComponent } from './outcomes_chart/chart.component';
import { PredictorsComponent } from './predictors/predictors.component';


// Component Config
const chartComponent = {
    el:'#app',
    store: AppStore,

    components: {
        'outcomes-component': ChartComponent,
        'predictors-component': PredictorsComponent
    }
}

export const app = new Vue(chartComponent)


const infoDialog = new MDCDialog(cEl('#app--dialog')())

const showDialog = (dialog)=> ()=> dialog.open() 

const infoBtn = cEl('#app--info')

infoBtn().addEventListener('click', showDialog(infoDialog))