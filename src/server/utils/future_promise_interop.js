/**
 * @module future_promise_interop - Provides interoperability between Promises & Futures (ramda-fantasy)
 */

const { Future } = require('ramda-fantasy')

// Checks
const isPromise = (x)=> typeof x.then === 'function'

const isFuture = (x)=> x['@@type'] === 'ramda-fantasy/Future'


// Type Swapping
const fToPromise = (future)=> new Promise((res, rej)=> future.fork(rej, res))

const pToFuture = (promise)=> Future((reject, resolve)=> promise.then(resolve).catch(reject))


// Type Casting/Enforcement
const castToPromise = (x)=> isFuture(x) ? fToPromise(x) : x

const castToFuture = (x)=> isPromise(x) ? pToFuture(x) : x


module.exports = {
    isPromise,
    isFuture,
    
    fToPromise,
    pToFuture,

    castToPromise,
    castToFuture
}