// import * as mongoose;
// import mongoose from 'mongoose';
const mongoose = require('mongoose')


const isDev = process.env.NODE_ENV !== 'production';

const _dev_db = 'mongodb://127.0.0.1:27017/actiontracker'

const _mongo_db = process.env.MONGODB_URI

const DB_URL = isDev && _mongo_db ? _mongo_db : _dev_db;


mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
})

mongoose.Promise = global.Promise


//-- Mongoose Connection
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

db.once('open', ()=> {
    console.log('\n\nMongo DB Connection is open')
})


//-- Now import & export our models

module.exports = {
    User: require('./user').User,
    UserSession: require('./user.session').UserSession,
    Account: require('./account').Account,
    Action: require('./action').Action,
    IpLocation: require('./ip_location').IpLocation,
    DB_URL
}