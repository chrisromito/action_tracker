/**
 * @module action - Provide Mongoose Model that represents the application performing an action
 *  (ie. A user created an account, an order was processed, etc.)
 *  
 */

const { Schema, model } = require('mongoose')


const ActionSchema = new Schema({
	user: {
		ref: 'User',
		type: Schema.Types.ObjectId,
		required: false
	},

	actionType: String,  // Ex. 'PATCH', 'search', 'click'

	timestamp: {
		type: Date,
		default: Date.now
	},

	// What did this action act upon?
	// Use 'id' and 'name' fields to reference an Object (eg. { id: 123, name: 'Account' })
	// and/or 'data' to store extra data about the action (eg. Load speed, mouse position, device rotation)
	target: {
		id: {
			type: Number,
			required: false
		},

		name: {
			type: String,
			required: false
		},

		data: {
			type: Schema.Types.Mixed,
			required: false
		}
	},

	// Optional actions or sequence of events that lead up to this action
	// Eg. [
	//     { value: 2, prop: 'quantity', action: 'increase'},
	//     { value: 3, prop: 'quantity', action: 'increase'}
	// ]
	breadCrumbs: [Schema.Types.Mixed]
})

//-- Action Model
const Action = model('Action', ActionSchema)


//-- Basic Action types that can be referenced elsewhere
// TODO (2019-Feb-27): Ensure this is used everywhere instead of hard-coded strings
const actionTypes = {
	//-- User Verbs
	search: 'search',
	searchSelection: 'search.select',
	login: 'login',
	logout: 'logout',
	signUp: 'signup',
	//-- HTTP Verbs
	get: 'GET',
	post: 'POST',
	patch: 'PATCH',
	delete: 'DELETE',
}


module.exports = {
	Action,
	actionTypes
}
