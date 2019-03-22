import * as R from 'ramda';
import * as utils from '../utils';


const VISIBLE_CLS = 'cr-popover--visible'

const _defaultConfig = {
    name: 'popover',
    elements: {
        selector: '.cr-popover',
        close: '[data-action="close"]',
        loader: '[data-action="loader"]'
    }
}

const elementLens = R.lensPath(['elements'])

const selector = R.view(
    R.compose(elementLens, R.lensPath(['selector']))
)

const setAttrs = (el, cls, parent_selector, config)=> {
    if (!el._popover) {
        el._popover = {}
    }
    el._popover.cls = cls
    el._popover.config = config
    el.dataset.parent = parent_selector
    return el
}


export const fromElement = (el)=> new el._popover.cls(el.dataset.parent, el._popover.config)




export class BasePopOver {
    constructor(parent_selector, config=_defaultConfig) {
        this.parent_selector = parent_selector
        this.config = R.mergeDeepRight(_defaultConfig, config)
        this.selector = `${this.parent_selector} ${selector(this.config)}`
        this.element = utils.cEl(this.selector)
    }

    static get [Symbol.species]() {
        /**
         * @static @method get [Symbol.species] - Helper method to distinguish
         * between class instances
         * @returns {this}
         */
        return this
    }

    init() {
        /**
         * @method init - Initialize the component, set up the DOM,
         * & set attrs on the PopOver element
         * @returns {Element}
         */
        return this.setAttrs()
    }

    static of(el) {
        return fromElement(el)
    }

    setAttrs() {
        /**
         * @method setAttrs - Set attrs on the popover element that
         * help us keep track of what's-what.
         * This facilitates generically composition of different types
         * of PopOvers from the DOM and vice-versa
         * @returns {Element}
         */
        return setAttrs(
            this.element(),
            this.constructor[Symbol.species],
            this.parent_selector,
            this.config
        )
    }

    destroy() {
        // Remove EventListeners, remove the element
        try {
            this.element().removeEventListener('click', onClick)
            utils.remove(this.element())
        } catch(err) {}
        return this
    }
    

    show() {
        utils.addClass(VISIBLE_CLS)(this.element())
        return this
    }

    hide() {
        utils.removeClass(VISIBLE_CLS)(this.element())
        return this
    }

    toggle() {
        utils.toggleClass(VISIBLE_CLS)(this.element())
        return this
    }
}



const onClick = (event)=> {
    if (event.target.dataset.action === 'close') {
        fromElement(
            utils.Dom(event.target).closestParent(utils.hasClass('cr-popover'))
        ).hide()
    }
}


/**
 * @func autoClose - Auto-magically close the Popover when a user clicks any 'close' button
 */
export function autoClose (el) {
    el.removeEventListener('click', onClick)
    el.addEventListener('click', onClick)
    return el
}




export class PopOver extends BasePopOver {
    init(...args) {
        return autoClose(super.init(...args))
    }
}



export class LoaderPopOver extends BasePopOver {
    constructor(...args) {
        super(...args)
    }

    icon() {
        return `<i class="mdi mdi-loading mdi-spin"></i>`
    }

    template() {
        return `
            <div class="cr-popover ${VISIBLE_CLS}">
                <div class="cr-popover--container">
                    <div class="cr-popover--loader">
                        ${this.icon()}
                    </div>
                </div>
            </div>
        `
    }

    render() {
        /**
         * @method render: Injects this template into the parent element
         * @returns {Function} Returns a function that calls `this.destroy()`
         */
        if (!!this.element()) {
            utils.remove(this.element())
        }
        
        const parent = utils.cEl(this.parent_selector)()
        parent.insertAdjacentHTML('beforeend', this.template())
        this.init()

        return ()=> this.destroy()
    }
}



export class ProgressBarPopOver extends LoaderPopOver {
    constructor(...args) {
        super(...args)
    }

    icon() {
        return `
            <div role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate">
                <div class="mdc-linear-progress__buffering-dots"></div>
                <div class="mdc-linear-progress__buffer"></div>
                <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                    <span class="mdc-linear-progress__bar-inner"></span>
                </div>
                <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                    <span class="mdc-linear-progress__bar-inner"></span>
                </div>
            </div>
        `.trim()
    }
}

