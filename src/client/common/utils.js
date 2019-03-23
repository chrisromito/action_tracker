import * as R from 'ramda'


// Utils
/*  One-liners
 *============================*/
export const isString = function (thing) {
    return typeof (thing) === 'string'
}
export const isBoolean = function (thing) {
    return typeof (thing) === 'boolean'
}
export const isArray = function (thing) {
    return Array.isArray(thing)
}
export const isFunction = function (thing) {
    return typeof (thing) === 'function'
}
export const isTrue = function (thing) {
    return Boolean(thing)
}
export const isFalse = function (thing) {
    return !Boolean(thing)
}

export const propIsFunction = function (fn, prop_name) {
    return isFunction(fn.prop_name)
}


/* Function Utils
 *============================*/
export const deferFn = function (fn) {
    return setTimeout(function () {
        return fn()
    }, 100)
}

export function debounce(func, delay) {
    /*
     * Source: https://medium.com/@_jh3y/throttling-and-debouncing-in-javascript-b01cad5c8edf
     * Usage:
     *    myEl.addEventListener("click", debounce(function() {
     *        return console.log("this log is getting debounced!");
     *    }, 1000)); // Wait 1000ms, then function will run
     */
    let inDebounce = undefined
    return function () {
        const context = this
        const args = arguments
        clearTimeout(inDebounce)
        return inDebounce = setTimeout(function () {
            return func.apply(context, args)
        }, delay)
    }
}

export function throttle(func, limit) {
    /* Source: Same as debounce function
     * Usage:
     *    myEl.addEventListener("click", throttle(function() {
     *        return console.log("throttling this console.log() statement");
     *    }, 1000));
     */
    let inThrottle = false
    let lastFunc = undefined
    let throttleTimer = undefined
    return function () {
        let context = this
        let args = arguments
        if (inThrottle) {
            clearTimeout(lastFunc)
            // noinspection JSValidateTypes
            return lastFunc = setTimeout(function () {
                func.apply(context, args)
                return inThrottle = false
            }, limit)
        } else {
            func.apply(context, args)
            // noinspection JSValidateTypes
            inThrottle = true
            // noinspection JSValidateTypes
            return throttleTimer = setTimeout(function () {
                return inThrottle = false
            }, limit)
        }
    }
}


// @Function facade({Function})({Array})-> [{this}, {Array}]
// Pass a callback into facade
//  the callback must accept an arbitrary number of arguments.
//  However, the first argument will be the bound context of 'this'
export const facade = function(fn){
    return function(...args) {
        return fn(...[this].concat(...args))
    }
}



/** CURRY
 * @param {Function} fn Function to curry.
 * @param {Number} lenght The arguments required to invoke the function. Optional. By default is fn.length
 * @returns {Function} The currified function.
 * Source: https://gist.github.com/amatiasq/2e4344792f28611fa499
 */
export function curry(fn, length) {
    length = length || fn.length
    return function currified() {
        let args = [].slice.call(arguments)
        if (args.length === 0) {
            return currified
        }
        if (args.length >= length) {
            return fn.apply(this, args)
        }
        let child = fn.bind.apply(fn, [this].concat(args))
        return curry(child, length - args.length)
    }
}


/* Partials
 */
export function partialWithScope(fn, scope) {
    let args = Array.prototype.slice.call(arguments, 2)
    return function () {
        return fn.apply(scope, Array.prototype.concat.apply(args, arguments))
    }
}


export function partial(fn) {
    return partialWithScope.apply(this, Array.prototype.concat.apply([fn, this], Array.prototype.slice.call(arguments, 1)))
}


export function ifTrueDo(condition, fn) {
    return isTrue(condition) ? fn() : condition
}


export function ifFalseDo(condition, fn) {
    return isFalse(condition) ? fn() : condition
}


export function ifTrueDoElse(condition, true_fn, false_fn) {
    return isTrue(condition) ? true_fn() : false_fn()
}


/* Dom Utils
*============================*/

export const cEl = (qs)=> (base_el=document)=> base_el.querySelector(qs)

export const cEls = (qs)=> (base_el=document)=> base_el.querySelectorAll(qs)


export const getEl = function (qs) {
    return document.querySelector(qs)
}


export const getEls = function (qs) {
    return document.querySelectorAll(qs)
}

export function getOffset(el) {
    el = el.getBoundingClientRect()
    return {
        left: el.left + window.scrollX,
        top: el.top + window.scrollY
    }
}


//-- CSS Classes
export const addClass = R.curry((cls, node)=> {
    node.classList.add(cls)
    return node
})

export const removeClass = R.curry((cls, node)=> {
    node.classList.remove(cls)
    return node
})

export const hasClass = R.curry((cls, node)=> node.classList.contains(cls))

export const toggleClass = R.curry((cls, node)=> hasClass(cls, node) ? removeClass(cls, node) : addClass(cls, node))

//-- Attrs
export const getAttr = R.curry((attr, node)=> node.getAttribute(attr))

export const setAttr = R.curry((attr, value, node)=> node.setAttribute(attr, value))


//-- dataSet
const dataSetLens = R.lensPath(['dataset'])

const dataAttrLens = (attr)=> R.compose(dataSetLens, R.lensPath([attr]))

export const getData = R.curry((attr, node)=> R.view(dataAttrLens(attr), node))

export const setData = R.curry((attr, value, node)=> {
    node.dataset[attr] = value
    return node
})

//-- Traversal
export const parent = (el)=> el.parentElement

export const child = cEl

export const children = (qs)=> (base_el=document)=> Array.from(cEls(qs)(base_el))

export const remove = R.tap((el)=> el.remove())


//-- Pure DOM helpers
export function Dom(el) {
    if (isString(el)) {
        el = getEl(el)
    }
    return {
        el: el,

        clearInner: function () {
            return el.innerHTML = ""
        },

        destroy: function () {
            return el.parentElement.removeChild(el)
        },

        addClass: function(cls) {
            return addClass(cls, el)
        },

        removeClass: function(cls) {
            return removeClass(cls, el)
        },

        hasClass: function(cls) {
            return hasClass(cls, el)
        },

        parentHasClass: function (_class) {
            return el.parentElement.classList.contains(_class)
        },

        childrenHaveClass: function (_class) {
            let class_arr = []
            el.childNodes.forEach(function (thing, ind) {
                class_arr.push(thing.classList)
            })
            return Boolean(class_arr.indexOf(_class) > -1)
        },

        parent: function () {
            return Dom(el.parentElement)
        },

        insertAfter: function (ref) {
            /*  Insert `el` after `ref` */
            ref.insertAdjacentElement('afterend', el)
            return el
        },

        appendTo: function(ref) {
            /* Insert `el` at the end of `ref` */
            ref.insertAdjacentElement('beforeend', el)
            return el
        },

        insertBefore:function(ref) {
            /* Insert `el` before `ref` */
            ref.insertAdjacentElement('beforebegin', el)
            return el
        },

        getOffset: ()=> getOffset(el),

        closestParent: function(comparitor) {
            /**
            *  @param {Function} comparitor: A function that, when given an
            *     element, will return a Boolean.  This method returns
            *     the first element that gets a truthy value from comparitor(el.parentElement)
            *  @returns {Element}: The first matching element, or false if
            *     none of the first 100 parent elements matched
            */
            let start = 0
            let max = 100
            let val = false
            let current = el

            for (let i = start; i < max; i++) {
                const parent = current ? current.parentElement : false
                const hasParent = isTrue(parent)
                if (hasParent && comparitor(parent)) {
                    val = parent
                    break
                }
                if ( i > max) {
                    break
                } else {
                    current = parent
                }
            }
            return val
        }

    }
}


export function Els(qs) {
    /* Utils for performing actions on node collections
     *  @param qs {String}: QuerySelector
     */
    const els = getEls(qs)
    const arr = [];
    // Immediately convert els to an array
    (function () {
        for (let i = 0; i < els.length; i++) {
            arr.push(els[i])
        }
    })()
    return {
        toArray: function () {
            return arr
        },
        iter: function (fn) {
            /** Iterate over `els` & run `fn` on each
             *    element in the node collection
             * @param {Function} fn: Callback to run on each el
             * @return {Array}
             */
            return arr.map(fn)
        },
    }
}


/* Array Utils
*============================*/

export const List = (arr)=> {
    return {
        max: ()=> {
            /* Get the greatest value in `arr` */
            return arr.reduce(function(a, b) {
                return Math.max(a, b)
            })
        }
    }
}


export const toIterator = (arr)=> {
    var nextIndex = 0
    return {
       next: function() {
           return nextIndex < arr.length ?
               {value: arr[nextIndex++], done: false} :
               {done: true}
       }
    }
}


/* Object Utils
*============================*/
export function merge(primary_obj, alias_obj) {
    return Object.assign({}, primary_obj, alias_obj)
}


export const toDict = (obj)=> {
    return Object.getOwnPropertyNames(obj).reduce((accum, item)=> {
        accum[item] = obj[item]
        return accum
    }, {})
}



/* String Utils
*=================================*/

export function uuid() {
    let _uuid = ""
    let i = 0
    let random
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            _uuid += "-"
        }
        _uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16)
    }
    return _uuid
}


/**
 * 
 * @param {*=''} str The target string
 * @returns {Object} 
 */
export const Str = (str)=> {
    return {
        trim: str.trim,
        titleCase: function() {
            // `mY shIfT KeY IS BroKEn` -> 'My Shift Key Is Broken'
            return str.replace(/\w\S*/g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            })
        },
        // score: StringSearch.score,
        // diff: StringSearch.diff,
        // editDistance: StringSearch.editDistance,
        alphaOnly: function() {
            /* Strip out all special characters */
            return str.match(/([a-zA-Z0-9]|\s)/gi).join('')
        },
        toDashed: function() {
            /** 
             * @example
             *  Str('HelloWorld').toDashed()
             *  >>> 'Hello-world'
             * @returns {String} Returns the hyphenated string
             */
            return str.replace(/([A-Z])/g, ($1)=> "-"+$1.toLowerCase())
        },
        toCamelCase: function() {
            /**
            * @example
            *  Str('Hello-world').toCamelCase()
            *  >>> 'HelloWorld'
            */
            return str.replace(/(\-[a-z])/g, ($1)=> $1.toUpperCase().replace('-',''))
        }
    }
}


export const objToAttrs = (obj)=> {
    return Object.entries(obj).reduce((accum, current)=> {
        let html = ` ${current[0]}='${current[1]}'`
        return String(accum + html)
    }, '')
}


export const appendClass = (obj, default_cls)=> {
    let cls = ' ' + default_cls
    if (isTrue(obj.hasOwnProperty('class'))) {
        obj.class += cls
    } else {
        obj.class = cls
    }
    return obj
}
