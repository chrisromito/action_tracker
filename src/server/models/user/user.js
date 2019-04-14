const uuid = require('uuid/v4');
const mongoose = require('mongoose')

const defaultDate = {
	type: Date,
	default: Date.now
}


const UserSchema = new mongoose.Schema({
	account: {
		ref: 'Account',
		type: mongoose.Schema.Types.ObjectId,
		required: false
	},

	sessions: [{
		ref: 'UserSession',
		type: mongoose.Schema.Types.ObjectId,
		required: false
	}],

	// Is this user currently using the application?
	active: {
		type: Boolean,
		default: false
	},

	uuid: {
		type: String,
		default: uuid,
		trim: true,
		unique: true
	},

	updated: defaultDate,
	created: defaultDate
})

exports.User = mongoose.model('User', UserSchema)
