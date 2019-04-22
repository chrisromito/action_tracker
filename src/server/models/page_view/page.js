const { Schema, model } = require('mongoose')
// const Schema = mongoose.Schema
// const model = mongoose.model
const { autoIncrement } = require('mongoose-plugin-autoinc')


const defaultToNow = {
	type: Date,
	default: Date.now
}

const optionalString = {
    type: String,
    required: false
}


const PageSchema = new Schema({
    client: {
        ref: 'Client',
        type: Schema.Types.ObjectId,
        required: true
    },

    created: defaultToNow,
    description: optionalString,
    name: optionalString,
    updated: defaultToNow,
    url: {
        host: optionalString,     // Does include the port
        hostname: optionalString, // Doesn't include the port
        href: optionalString,
        pathname: optionalString, // '/mypath' in 'www.example.com/mypath'
        port: optionalString,
        protocol: optionalString,  // http, https, ws, etc.
        origin: optionalString,
    },

    // (implicit) index: Number - AutoIncrement increments on this field,
    // which makes it easier to track the # of pages we have registered,
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
