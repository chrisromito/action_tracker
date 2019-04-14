/**
 * @module page_view - Provide Mongoose model representation of a page
 * viewed by a user (user session).
 * 
 * The UserSession is referenced instead of User/Account because a User could view multiple pages
 * at once (multiple tabs/windows).  However, UserSession can be unique to each tab, depending
 * on actual implementation.
 * 
 * This can also be referenced via the 'Action' Model, if it seems fitting for your application to treat
 * page views as an 'Action'.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = mongoose.model

const defaultToNow = {
	type: Date,
	default: Date.now
}


const PageViewSchema = new Schema({
    userSession: {
        ref: 'UserSession',
        type: Schema.Types.ObjectId,
        required: false
    },

    page: {
        ref: 'Page',
        type: Schema.Types.ObjectId,
        required: true
    },

    parent: {
        ref: 'PageView',
        type: Schema.Types.ObjectId,
        required: false
    },

    url: String,
    active: {
        type: Boolean,
        default: false
    },

    meta: Schema.Types.Mixed,
    created: defaultToNow,
    updated: defaultToNow
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true }
})


PageViewSchema.virtual('children', {
    ref: 'PageView',
    localField: 'parent',
    foreignField: '_id',
    justOne: false,
    options: {
        limit: 250
    }
})


PageViewSchema.methods.getChildren = function() {
    return PageView.find({
        parent: this._id
    }).exec()
}


const PageView = model('PageView', PageViewSchema)

module.exports = {
	PageView
}
