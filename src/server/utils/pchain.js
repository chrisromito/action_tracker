/**
 * @module pchain - Promise chain utility function
 * Execute an Array of Promises in a sequential order (unlike Promise.all() and Promise.race())
 * 
 * @example
 * >>> const randomIntBetween = (min, max)=> Math.floor(
 *    Math.random() * (max - min)
 * ) + min
 * 
 * >>> const logThunk = (index)=> ()=> new Promise((resolve)=> setTimeout(()=> {
 *    console.log(`Function index: ${index}`)
 *    resolve(index)
 * }, randomIntBetween(10, 1000))) 
 *
 * >>> const thunks = [
 *    logThunk(0),
 *    logThunk(1),
 *    logThunk(2),
 *    logThunk(3)
 * ]
 * 
 * >>> pChain(thunks) // => [0, 1, 2, 3]
 * // Function index: 0
 * // Function index: 1
 * // Function index: 2
 * // Function index: 3
 * 
 * >>> Promise.all(thunks.map((fn)=> fn())) // => [0, 1, 2, 3]
 * // Function index: 3
 * // Function index: 0
 * // Function index: 1
 * // Function index: 2
 */


const toPromise = (fn)=> new Promise((resolve, reject)=> {
    try {
        resolve(fn())
    } catch(err) {
        reject(err)
    }
})



/**
 * @func pChain :: fns, accum => {Promise} => [a, b, c]
 * @param {Function[]} fns - Array of thunks
 * @param {*} accum - Private param.  Keeps track of what each thunk resolved to
 * @returns {Promise => *[]} - Returns a Promise that resolves w/ the values that each
 * thunk resolved to
 */
const pChain = (fns, accum=[])=> !fns.length ?
    accum : 
    Promise.resolve(toPromise(fns[0]))
        .then((data)=> pChain(
            fns.slice(1, fns.length),
            accum.concat(data)
        ))


module.exports = pChain
