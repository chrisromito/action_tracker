/**
 * FIXME: Implement Action
 * FIXME: Implement router
 */
import { mergeDeepRight } from 'ramda'
import { Config, defaultConfig } from './config'
import { Action } from './action/index'
import { router } from './router/index'



export class ActionTracker {
    constructor(config=defaultConfig, ...args) {
        this.config = mergeDeepRight(Config.getGlobalConfig(), config)
        this.adapter = adapter(this.config, ...args)
        this.router = router(this.config)
        this._pageView = null
        this._breadCrumbs = []
    }

    init() {
        /**
         * @method init - Sets up the global config
         * @returns {ActionTracker}
         */
        this._pushGlobalConfig(this.config)
        return this
    }

    /**
     * Action Methods
     */
    trackView(payload=null) {
        /**
         * @method trackView - Tracks the current Page View
         * @param {[payload=(null|Object)]} - Extra data to send w/ the PageView request
         * @returns {Future<Error, PageView>}
         */
        if (this._pageView !== null) {
            let messagePayload = payload
            try {
                messagePayload = JSON.stringify(payload)
            } catch(err) {
                // It's all good, it just can't be JSON serialized.
            }

            throw new Error(`ActionTracker attempted to track this view after it's already been tracked!
            View Payload: ${messagePayload}`)
        }
        
        return this.adapter.trackView(this.router, payload)
    }

    getPageView() {
        return this._pageView
    }

    setPageView(pageView) {
        this._pageView = pageView
    }

    pushAction(action) {
        /**
         * @method pushAction - Pushes (sends) an Action
         * @param {[action=(null|Object)]} - Action payload
         * @returns {Future<Error, Action>}
         */
        return this.router.pushAction(action)    
    }

    /**
     *  BreadCrumbs
     */
    addBreadCrumb(data) {
        this._breadCrumbs = this._breadCrumbs.concat(data)
        return this._breadCrumbs
    }

    getBreadCrumbs() {
        return this._breadCrumbs
    }

    clearBreadCrumbs() {
        this._breadCrumbs = []
        return this
    }

    _pushGlobalConfig(newConfig) {
        /**
         * @private _pushGlobalConfig
         * @param {Object} newConfig - Data to push to the global config.
         * This must be an Object.  The Object itself will be merged with the
         * current global config, with the newConfig taking priority.
         * Ie. Anything in newConfig that's NOT in the global Config will be added.
         * Anything in newConfig that IS in the global Config will overwrite the global Config.
         * 
         * @returns {Object} new global config
         */
        return Config.extendGlobal(newConfig)
    }

}