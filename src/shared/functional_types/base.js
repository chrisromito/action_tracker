const R = require('ramda');
import * as Maybe from 'maybe';


export class BaseFunctor {
    constructor(...values) {
        /**
         * @param  {...any} values - Data/state for this functor
         */
        this._values = values
    }

    static of(...values) {
        /**
         * @static @method of - Create a new functor w/ context
         * @param {...any} values - Data/state for this functor
         * @returns {BaseFunctor[...values]} - A new instance of this functor
         * with the specified context
         */
        const Cls = this[Symbol.species]
        return new Cls(...values)
    }

    static lift(...values) {
        /**
         * @static @method lift:: (...v)=> A[...v]
         * Lift '...values' into a BaseFunctor
         * If it is already a functor, make it a new one (Immutability)
         * Otherwise, return a functor w/ the context
         * @param {(...any | A[...any])} values - Data/state for this functor
         * @returns {A[...values]}
         */
        const Cls = this.constructor[Symbol.species]
        const scope =  values instanceof Cls ? values.values() : values
        return Cls.of(scope)
    }

    static get [Symbol.species]() {
        /**
         * @static @method get [Symbol.species] - Helper method to distinguish
         * between class instances
         * @returns {this}
         */
        return this
    }

    values() {
        return this._values
    }

    map(fn=R.identity) {
        /**
         * @method map:: (fn a => a)=> B[...a] 
         * Create a new functor, with the context
         * being the current context after applying function `fn` to each value
         * @param {Function} fn - The function to apply to this.values
         * @returns {BaseFunctor[...values]}
         */
        const Cls = this.constructor[Symbol.species]
        return new Cls(...this.values().map(fn))
    }
}


export class BaseApplicative extends BaseFunctor {
    flatMap(fn=R.identity) {
        const Cls = this.constructor[Symbol.species]
        // Flatten the result array & apply `fn` to all values
        const result = [].concat.apply([], this.values().map(
            R.ifElse(
                (v)=> v instanceof Cls,
                (v)=> v.values().map(fn),
                (v)=> fn(v)
            )
        ))

        return Cls.of(...result)
    }
}
