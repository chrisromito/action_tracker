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

	sessionId: String,

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

exports.UserSession = model('UserSession', UserSessionSchema)
