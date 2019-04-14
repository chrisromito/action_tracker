const { Schema, model } = require('mongoose')
// const Schema = mongoose.Schema
// const model = mongoose.model
const { autoIncrement } = require('mongoose-plugin-autoinc')

const defaultToNow = {
	type: Date,
	default: Date.now
}


const PageSchema = new Schema({
    name: {
        type: String,
        required: false
    },

    description: {
        type: String,
        required: false
    },

    url: String,
    created: defaultToNow,
    updated: defaultToNow
    // index: Number - AutoIncrement increments on this field
    // this makes it easier to track the # of pages we have registered,
    // making abstract references to an arbitrary page much more efficient,
    // since we don't need to do a lookup based on the name or URL.
    // Ex. In a Neural Network (hint hint)
})

PageSchema.plugin(autoIncrement, {
    model: 'Page',
    field: 'index'
})

const Page = model('Page', PageSchema)

module.exports = {
    Page
}
