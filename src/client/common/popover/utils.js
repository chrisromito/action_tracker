export function curry(fn, length) {
    length = length || fn.length;
    return function currified() {
        let args = [].slice.call(arguments);
        if (args.length === 0) {
            return currified;
        }
        if (args.length >= length) {
            return fn.apply(this, args);
        }
        let child = fn.bind.apply(fn, [this].concat(args));
        return curry(child, length - args.length);
    }
}

export const compose = (...fns)=> (x)=> fns.reduceRight((y, f) => f(y), x)

export const pipe = (...fns)=> (x)=> fns.reduce((y, f) => f(y), x)


export const makeArray = (x)=> Array.from(x)

export const forEach = curry((fn, arr)=> {
    makeArray(arr).forEach(fn)
    return arr
})


export const addClass = curry((cls, node)=> {
    node.classList.add(cls)
    return node
})


export const removeClass = curry((cls, node)=> {
    node.classList.remove(cls)
    return node
})

export const hasClass = curry((cls, node)=> node.classList.contains(cls))

export const toggleClass = curry((cls, node)=> hasClass(cls, node) ? removeClass(cls, node) : addClass(cls, node))

export const getAttr = curry((attr, node)=> node.getAttribute(attr))

export const setAttr = curry((attr, value, node)=> node.setAttribute(attr, value))

export const cEl = curry(
    (qs, node)=> (node ? node : document).querySelector(qs)
)

export const remove = (el)=> el.remove()