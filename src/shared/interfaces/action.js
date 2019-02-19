/**
 * @module interfaces/action.js - Provide a consistent interface/Object-representation of a 
 */


const empty = {}



class Action {
    constructor(actionType, target=empty, breadCrumbs=null) {
        this.actionType = actionType
        this.target = target
        this.breadCrumbs = breadCrumbs
        this.user = null
    }

    pushBreadCrumb(crumb) {
        this.breadCrumbs = this.breadCrumbs.concat(crumb)
        return this
    }

    toObject() {
        return {
            actionType: this.actionType,
            target: !this.target ? {} : this.target,
            breadCrumbs: this.breadCrumbs,
            user: this.user
        }
    }

    static of(action) {
        return Object.assign(
            {},
            new Action(action.actionType, action.target, action.breadCrumbs),
            action
        )
    }
}

exports.Action = Action


/**
 * Element/DOM actions
 *================================*/
const numberOrNull = (v)=> isNaN(v) ? null : parseInt(v)

const nodeAttrs = (el)=> ({
    id: numberOrNull(el.dataset.id || el.id),
    data: R.tryCatch(
        R.compose(JSON.parse, JSON.stringify, R.prop('dataset')),
        R.identity({})
    )(el),
    name: el.dataset.name || el.name || el.title || ''
})



class EventAction extends Action {
    constructor(event=empty, data=null) {
        super(event.type, data || nodeAttrs(event.target))
    }

    static of(event) {
        return new EventAction(event)
    }

    lift(event) {
        /**
         * @method lift - Lift an Event into an existing EventAction,
         * and make the existing EventAction a breadcrumb in the new EventAction
         */
        return this.of(event).pushBreadCrumb(this)
    }
}

exports.EventAction = EventAction