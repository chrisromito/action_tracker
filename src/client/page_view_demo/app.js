import './app.scss'

import Vue from 'vue'
// App
import store from './store'
import { cEls, cEl, addClass, removeClass } from '../common/utils'
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



//-- Tabs

const tabNav = document.querySelector('#tab-nav')

cEls('.mdc-list-item')(tabNav).forEach((el)=> el.addEventListener('click', onTabClick))

function onTabClick(event) {
    event.preventDefault()

    tabContainers().forEach(hideTab)
    showTab(
        cEl(this.getAttribute('href'))()
    )
}


const hideTab = removeClass('chart--visible')
const showTab = addClass('chart--visible')
const tabContainers = ()=> Array.from(cEls('.chart--container')())



