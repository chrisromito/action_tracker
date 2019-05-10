const brain = require('brain.js')


class BaseType {
    constructor(data, context) {
        this._data = {...data}
        this._context = {...context}
    }

    static get [Symbol.species]() {
        /**
         * @static @method get [Symbol.species] - Helper method to distinguish
         * between class instances
         * @returns {this}
         */
        return this
    }

    value() {
        return {
            data: this._data,
            context: this._context
        }
    }

    args() {
        return [this._data, this._context]
    }

    of() {
        /**
         * @method of - Creates a new BaseType instance
         * with the same values as this instance
         * @returns {BaseType}
         */
        const cls = this[Symbol.species]
        const args = Object.values(this.value())
        return new cls(...args)
    }

    ap(fn) {
        /**
         * @method ap - Applies function `fn` to the current value,
         * and returns the transformed value
         * @sig BaseType[a, b] :: fn ( ( a, b )-> c ) -> c
         * @param {Function} fn - A 2-arity function
         * @returns {*}
         */
        return fn(...this.args())
    }

    map(fn) {
        /**
         * @method map - Applies function `fn` to the current value
         * @sig BaseType[a, b] :: fn ( ( a, b )-> c ) -> BaseType[c]
         * @param {Function} fn - A 2-arity function
         * @returns {BaseType[a, b]}
         */
        const cls = this[Symbol.species]
        return new cls(
            ...this.ap(fn)
        )
    }
}


/**
 * @class DataState - Generic representation of the state of the data within
 * different parts of our Network chain.
 */
class DataState extends BaseType {
    data() {
        return this.value().data
    }

    context() {
        return this.value().context
    }

    mapData(fn) {
        const cls = this[Symbol.species]
        return new cls(
            fn(...this.args()),
            this.context()
        )
    }

    mapContext(fn) {
        // Deconstruct, apply fn, reconstruct
        const cls = this[Symbol.species]
        return new cls(
            this.data(),
            fn(...this.args())
        )
    }
}


/**
 * @class NetworkState - Generic representation of the state of our Neural Network
 */
class NetworkState extends BaseType {
    static brain() {
        return brain
    }

    static getNetwork() {
        return brain.recurrent.RNNTimeStep
    }
}



module.exports = {
    BaseType,
    DataState,
    NetworkState
}