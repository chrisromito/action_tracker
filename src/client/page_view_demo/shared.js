import * as R from 'ramda'

export const activeLens = R.lensPath(['active'])
export const updatedLens = R.lensPath(['updated'])
export const createdLens = R.lensPath(['created'])
export const userSessionLens = R.lensPath(['userSession'])

export const activeFilter = R.filter(R.view(activeLens))

/**
 * @func deltaTime :: d {Date} => n {Number}
 * Get the difference between `d` and Date.now() (in milliseconds)
 */
export const deltaTime = R.compose(
    R.invoker(2, 'toFixed')(1),
    Math.abs,
    (d)=> R.subtract(Date.now(), d)
)

export const deltaSeconds = R.compose(
    R.divide(R.__, 1000),
    deltaTime
)
