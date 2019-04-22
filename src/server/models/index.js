// import * as mongoose;
// import mongoose from 'mongoose';
const mongoose = require('mongoose')
const glob = require('glob')
const path = require('path')


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


//-- Import & export our models
const _appModels = glob.sync('./src/server/models/**/index.js')
    .filter((filePath)=> filePath.indexOf('migrations') <= -1)
    .reduce((moduleExport, filePath)=> {
        console.log('filePath:')
        console.log(filePath)
        const moduleToExport = require(path.resolve(filePath))
        let tempExport = {}
        console.log('moduleToExport: ')
        console.log(moduleToExport)

        Object.entries(moduleToExport)
            .forEach((pair)=> {
                console.log('moduleToExport.forEach.pair:')
                console.log(pair)
                const key = pair[0]
                const value = pair[1]
                tempExport[key] = value
            })

        Object.entries(moduleExport)
            .forEach((pair)=> {
                console.log('moduleExport.forEach.pair:')
                console.log(pair)
                const key = pair[0]
                const value = pair[1]
                tempExport[key] = value
            })
        return tempExport
    }, { DB_URL })

module.exports = _appModels

// module.exports = {
//     User: require('./user/user').User,
//     UserSession: require('./user/user.session').UserSession,
//     Account: require('./account').Account,
//     Action: action.Action,
//     actionTypes: action.actionTypes,
//     IpLocation: require('./ip_location').IpLocation,
//     NeuralStep: require('./neural_step').NeuralStep,
//     PageView: require('./page_view/page_view').PageView,
//     Page: require('./page_view/page').Page,
//     DB_URL
// }