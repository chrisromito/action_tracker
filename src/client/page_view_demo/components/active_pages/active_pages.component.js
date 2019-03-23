import './active_pages.scss'
import * as R from 'ramda'
import Vue from 'vue'
import * as utils from '../../../common/utils'



export const ActivePagesComponent = Vue.component('active-pages', {
    template: `
        <div id="ap--container" class="ap--table mdc-card margin--v-25">
            <h3 class="mdc-typography--headline4 margin--15">
                Active Pages
            </h3>
            
            <div class="pad--15 ap--list mdc-list" ref="apList">
                <!-- Faux Header -->
                <div class="mdc-list-item">
                    <span class="ap--header mdc-list-item__text">
                        <div class="ap--header-first ap--cell">
                            Active Page
                        </div>
                        <div class="ap--header-second ap--cell">
                            Active Users
                        </div>
                    </span>
                </div>
                
                <!-- List Out the Pages -->
                <div v-for="(page, index) in activePerPage"
                        :key="page.uuid"
                        class="mdc-list-item">
                    <span class="ap--item mdc-list-item__text">
                        <div class="ap--index ap--cell">
                            {{ index + 1 }}.
                        </div>
                        <div class="ap--url ap--cell">
                            {{ page.url }}
                        </div>
                        <div class="ap--count ap--cell">
                            {{ page.count }}
                        </div>
                        <div class="ap--percent ap--cell">
                            {{ page.percent }}%
                        </div>
                    </span>
                </div>
            </div>
        </div>
    `,

    computed: {
        activePerPage: function() {
            return this.$store.getters['real_time/activePerPage']
        }
    },

    mounted: function() {
        window._ActivePagesComponent = this
    }

})