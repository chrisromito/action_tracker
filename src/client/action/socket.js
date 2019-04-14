import { webSocket } from 'rxjs/webSocket'
import { first } from 'rxjs/operators'
// import { identity } from 'ramda';
import * as R from 'ramda';
import { Action, EventAction } from '../../shared/interfaces/action';


export const defaultSocketConfig = {
    url: `ws://${window.location.hostname}:8080/action`,

    receiveUserSession: false
}


export const defaultSubscriberConfig = {
    next: R.identity,
    error: undefined,
    complete: R.identity
}


export class ActionSocket {
    constructor(socketConfig) {
        this.socketConfig = R.mergeDeepRight(defaultSocketConfig, socketConfig)
        this.socket = null  //webSocket(config.url)
        this.subscriberConfig = {} // subscriberConfig
    }

    init(subscriberConfig) {
        /**
         * @method init - Setup the socket & pass the receiveUserSession
         * callback into the first message handler
         */
        const subConf = R.mergeDeepRight(defaultSubscriberConfig, this.subscriberConfig)
        this.subscriberConfig = subConf

        // Create the WebSocket connection (initialized when we call subscribe())
        // set up the subscribers, & (optionally) set up the callback for our initial message
        // containing the UserSession & User Objects
        this.setSocket()
            .subscribe(subConf.next, subConf.error, subConf.complete)
        
        if (this.socketConfig.receiveUserSession) {
            this.socket.pipe(first())
                .subscribe(this.socketConfig.receiveUserSession)
        }

        return this
    }

    setSocket() {
        // TODO: Review if we need a safety here to ensure we don't subscribe
        // to the same socket multiple times
        this.socket = webSocket(this.socketConfig.url)
        return this.socket
    }

    pushAction(action) {
        /**
         * @method pushAction - Send an action to the server via WebSocket message
         * @param {Action} action - The Action object - @see shared/interfaces/action.js -> class Action
         * @returns {Subscriber}
         */
        return this.socket.next(
            JSON.stringify(action.toObject())
        )
    }
}


export const ActionSocketSubscriber = (subscriberConfig, socketConfig=defaultSocketConfig)=> {
    return new ActionSocket_(subscriberConfig, socketConfig).init()
}
