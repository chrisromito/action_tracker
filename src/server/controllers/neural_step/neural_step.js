const R = require('ramda')
const { NeuralStep } = require('../../models/index')
const { DateRangeFilter } = require('../common/common')
const Io = require('../../../shared/functional_types/io')



const normalizeId = R.over(
    R.lensPath(['id']),
    R.view(R.lensPath(['_id']))
)

const serializeModels = R.map(normalizeId)


/**
 * @function NeuralStepTemplate - Template view to render the SPA for Neural Network analysis
 * @param req - Express Request Object
 * @param res - Express Response Object
 *
 */
const NeuralStepTemplate = (req, res)=> {
    const data = {}
    return res.render('page_view_demo/page_view_demo.html', {
        data
    })
}


/**
 * @function NeuralStepList - Get a list of NeuralStep instances within a given date range.
 * This returns a JSON view of the NeuralSteps, which help determine:
 *   1. What was analyzed over a given time period?
 *   2. How "relevant" is each field to the user (with respect to searching through data)?
 *   3. How has the significance of each field changed over time?
 *
 *
 * URL Filter Params:
 * timestamp_start {Number}
 * timestamp_end {Number}
 *
 *
 * @param req - Express Request Object
 * @param res - Express Response Object
 */
const NeuralStepList = (req, res)=> {
    const filterObj = setNeuralStepFilters(req.query, {}).run()

    return NeuralStep.find(filterObj, null)
        .populate('origin')
        .exec()
        .then(R.pipe(
            serializeModels,
            (ns)=> res.json(ns)
        ))
}


const timeStampFilter = (query)=> (obj)=> DateRangeFilter('timestamp', query, obj)

const originModelFilter = (query)=> (obj)=> R.hasIn('originModel', query) ? R.assoc('originModel', obj) : obj

const setNeuralStepFilters = (query, obj)=> Io.lift(obj)
    .map(timeStampFilter(query))
    .map(originModelFilter(query))


module.exports = {
    NeuralStepList
}