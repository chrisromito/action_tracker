/**
 * @module neural_step - Provide Mongoose model that represents
 * a step within a recurrent neural network
 * This facilitates training a neural network using persistant data
 * as it changes over time.  The dynamic lookup field ('origin'/'originModel')
 * 
 *
 * Eg. Analyzing comments to create an "autocomplete" feature,
 * by referencing the `Comment` model, and analyzing comments that
 * were added between yesterday (the last time the training task ran)
 * and now, while remembering what it's learned over time.
 *
 */

// const mongoose = require('mongoose')
// const Schema = mongoose.Schema
// const model = mongoose.model

const { Schema, model } = require('mongoose')


const NeuralStepSchema = new Schema({
    //-- Is this Neural Network for a specific client?
    client: {
        ref: 'Client',
		type: Schema.Types.ObjectId,
        required: false
    },

    //-- Dynamic Model lookup fields
    origin: {
        type: Schema.Types.ObjectId,
        required: false,
        // Instead of a hard-coded model name in 'ref', 'refPath'
        // tells Mongoose to look at the 'originModel' property
        // to look up the right model
        refPath: 'originModel'
    },

    originModel: {
        type: String,
        required: true,
        enum: [
            // Models that Mongoose can look up
            'Action',
            'User',
            'UserSession',
            'PageView'
        ]
    },

    //-- Neural meta data
    // Fields that were assessed
    fields: [String],
    // Data: Assessment results - The weight of each field
    // This is what we use to 'weigh' the significance of each field that was assessed
    data: {
        type: Map,
        of: Number
    },

    meta: Schema.Types.Mixed,

    timestamp: {
        type: Date,
        default: Date.now
    }
})


exports.NeuralStep = model('NeuralStep', NeuralStepSchema)


/**
 *
 * @typedef NeuralStepMeta - Meta data created by brain.js for
 * recurrent neural networks.  This is used to help a network 'remember'
 * what it's done.  The meta data is stored on the 'meta' field on the NeuralStep model.
 *
 * @property {String} type: The type of neural network (we use Recurrent Neural Networks here)
 * @property {Object} options: Options/settings/config for the network
 * @property {Object[]} hiddenLayers: Hidden layer meta-data.  This is where most of the magic lives
 * @property {Object} outputConnector:
 * @property {Object} output
 */


/*

Example 'meta' object:
{
    type: 'RNNTimeStep',
    options: {
        inputSize: 1,
        hiddenLayers: [ 20 ],
        outputSize: 1,
        learningRate: undefined,
        decayRate: 0.999,
        smoothEps: 1e-8,
        regc: 0.000001,
        clipval: 5
    },
    hiddenLayers: [ { weight: [Object], transition: [Object], bias: [Object] } ],
    outputConnector: {
        rows: 1,
        columns: 20,
        weights: Float32Array [
                 -0.041560377925634384,
                -0.03150321915745735,
                ...
        ]
    },
    output: {
        rows: 1,
        columns: 1,
        weights: Float32Array [ -0.02684454433619976 ]
    }
}

*/