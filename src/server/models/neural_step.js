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

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = mongoose.model


const NeuralStepSchema = new Schema({

    //-- Dynamic Model lookup fields
    origin: {
        type: Schema.Types.ObjectId,
        required: false,
        // Instead of a hardcoded model name in 'ref', 'refPath'
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
            'UserSession'
        ]
    },

    //-- Neural meta data
    // Fields that were assessed
    fields: [String],
    // Data: Assessment results
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
