const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = mongoose.model


const defaultDate = {
	type: Date,
	default: Date.now
}


const UserSessionSchema = new Schema({
	user: {
		ref: 'User',
		type: Schema.Types.ObjectId,
		required: true
	},

	// Is this the currently active session?
	active: {
		type: Boolean,
		default: false
	},

	ip_address: {
		type: String,
		required: false
	},

	device: {
		type: String,
		required: false
	},

	
	updated: defaultDate,
	created: defaultDate
})


// UserSessionSchema.pre('save', function(next) {
//     this.updated = Date.now()
//     return next(this)
// })

exports.UserSession = model('UserSession', UserSessionSchema)
