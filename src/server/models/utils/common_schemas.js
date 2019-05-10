const { Schema } = require('mongoose')


const defaultToNow = {
	type: Date,
	default: Date.now
}


const updatedCreated = {
    updated: defaultToNow,
    created: defaultToNow
}


const updatedCreatedSchema = new Schema(updatedCreated)


const nameSortOrder = {
    name: {
        type: String,
        required: false
    },

    description: {
        type: String,
        required: false
    },

    sortOrder: {
        type: Number,
        default: 0
    }
}


const nameSortOrderSchema = new Schema(nameSortOrder)


const genericFields = {...updatedCreated, ...nameSortOrder}



module.exports = {
    updatedCreatedSchema,
    nameSortOrderSchema,
    genericFields
}