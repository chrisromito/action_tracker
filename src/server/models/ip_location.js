const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = mongoose.model


const IpLocationSchema = new Schema({
	ipFrom: Number,
	ipTo: Number,
	latitude: Number,
	longitude: Number,

	countryCode: String,
	countryName: String,
	regionName: String,
	cityName: String,
	zipCode: String,
	timeZone: String
})


exports.IpLocation = model('IpLocation', IpLocationSchema)
