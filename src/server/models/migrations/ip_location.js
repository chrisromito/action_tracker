/**
 * Provide migrations for setting up the ip_address document
 * using the .csv files found in the 'csv' root directory
 */

const fs = require('fs')
const path = require('path')
const parse = require('csv-parse/lib/sync')
const R = require('ramda')

// Import the model from index.js so we can execute within the connection context
// import { IpLocation } from '../index';
const IpLocation = require('../index').IpLocation;



const ioKeys = [
    // ['column_name_in_file', 'columnNameInDb']
    ['ip_from', 'ipFrom'],
    ['ip_to', 'ipTo'],
    ['latitude', 'latitude'],
    ['longitude', 'longitude'],
    ['country_code', 'countryCode'],
    ['country_name', 'countryName'],
    ['region_name', 'regionName'],
    ['city_name', 'cityName'],
    ['zip_code', 'zipCode'],
    ['time_zone', 'timeZone']   
]

const fileKey = R.lensIndex(0)

const dbKey = R.lensIndex(1)


const parseFile = (input_str)=> parse(input_str, {
    cast: true,
    columns: ioKeys.map(R.view(dbKey))
})



const filePath = path.resolve('./csv/ip_location.csv')


const readFile = (fn)=> fs.readFile(
    filePath,
    {encoding: 'utf-8'},
    (err, data)=> {
        if (err) {
            console.log('Error:')
            console.log(err)
            return err
        }
        return fn(data)
    }
)


const migrateRight = (data)=> {
    console.log(`Successfully migrated IP Addresses`)
    return data
}

const migrateLeft = (err)=> console.error(err)


const migratePred = (err, data)=> err ? migrateLeft(err) : migrateRight(data)


const migrateIpLocation = R.compose(
    (parsed_data)=> IpLocation.create(parsed_data, migratePred),
    parseFile
)




module.exports = ()=> readFile(migrateIpLocation)
