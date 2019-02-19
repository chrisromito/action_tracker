const R = require('ramda');
const moment = require('moment');
import Vue from 'vue';
import { MDCSlider } from '@material/slider';
import { MDCSelect } from '@material/select';
import { MDCTextField } from '@material/textfield';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';


// App
import { AppStore } from '../app.store';
import { TotalExpenditure, weightDiffKilos } from '../common/bmr';

// Templates
import { DateForm } from './predictors.date.form';
import { IntakeForm } from './predictors.intake.form';
import { PhysicalActivityForm } from './predictors.pal.form';
import { UserForm } from './predictors.userform';

import * as utils from '../../common/utils';


// Templates
export const formTemplate = [
    DateForm,
    IntakeForm,
    PhysicalActivityForm,
    UserForm
].map(R.prop('template')).join('')


const today = moment().toDate()

const toInches = (feet, inches=0)=> (12 * feet) + inches
const toCm = R.multiply(2.54)




/**
 * @export PredictorsComponent {Vue.component}
 * *
 */
export const PredictorsComponent = Vue.component('predictors-component', {
    template: `
        <div id="predictors-component--container" class="predictors-component--container flex as jc pad--v-20">
            <div class="predictors-component--group i-flex as js">
                ${DateForm.template}
                ${IntakeForm.template}
                ${PhysicalActivityForm.template}
            </div>
            <div class="predictors-component--group i-flex as js">
                ${UserForm.template}
            </div>
        </div>
    `,

    data: function() { return {
        dateRange: 30,
        calorie_intake: AppStore.state.calorie_intake,

        // TODO: Map this to userStats.is_male
        sex: 'male',

        // TODO: Map this to userStats.height
        height: {
            feet: 5,
            inches: 7
        },

        userStats: AppStore.state.userStats
    }},

    watch: {
        calorie_intake: function(val) {
            AppStore.commit('setIntake', Number(val))
        },

        dateRange: function(val) {
            const diff = moment(today).add(this.dateRange, 'days').toDate()

            AppStore.commit('setDateRange', {
                start: today,
                end: diff
            })
        },

        height: function() {
            this.pushState()
        },

        userStats: function() {
            this.pushState()
        },

        sex: function() {
            this.pushState()
        }
    },

    methods: {
        pushState: function() {
            const stats = this.userStats
            const calcHeight = toCm(
                toInches(Number(this.height.feet), Number(this.height.inches))
            )

            const newStats = {
                weight: Number(stats.weight),
                age: Number(stats.age),
                is_male: (stats.sex === 'male'),
                pal: Number(stats.pal),
                height: calcHeight
            }

            AppStore.commit('setStats', newStats)

            AppStore.commit('setIntake', Number(this.calorie_intake))

            AppStore.commit('setDateRange', {
                start: today,
                end: moment(today).add(this.dateRange, 'days').toDate()
            })

        },

        onDateChange: function(mdc_slider) {
            this.dateRange = mdc_slider.value
        }
    },

    mounted: function() {
        const _this = this
        // Let the DOM render & all the other initialization occur,
        // then setup our MDC components.  The slight delay helps
        // prevent resizing related issues
        utils.deferFn(()=> _this.pushState())


        //-- Physical Activity Select
        const palSelect = new MDCSelect(
            this.$refs[PhysicalActivityForm.ref]
        )

        palSelect.listen('MDCSelect:change', (e)=> {
            _this.$set(_this.userStats, 'pal', e.detail.value)   
        })

        //-- Date slider
        const dateSlider = initSlider(
            this.$refs[DateForm.ref]
        ).slider

        dateSlider.listen('MDCSlider:change', utils.debounce(
            (e)=> _this.onDateChange(e.detail)),
            50
        )

        utils.deferFn(initMdcComponents)

    },

    updated: function() {
        this.pushState()
    }
})




const initMdcComponents = ()=> {
    /** Setup MDC components after the form elements are rendered
     */
    const container = utils.cEl('[data-action="predictors-component"]')()
    utils.cEls('.mdc-text-field')(container).forEach((i)=> new MDCTextField(i))
    utils.cEls('.mdc-radio')(container).forEach((i)=> new MDCRadio(i))
    utils.cEls('.mdc-form-field')(container).forEach((i)=> new MDCFormField(i))
}


const initSlider = (el)=> {
    const slider = new MDCSlider(el)
    return {
        el: el,
        slider: slider
    }
}

