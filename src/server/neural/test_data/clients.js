const { URL } = require('url')
const R = require('ramda')
const { Client, Domain } = require('../../models/index')


const testDomainUrl = new URL('https://www.action_tracker_test.com')

//-- Client Data
const createTestClient = ()=> new Client({
    name: 'Test Client',
    description: 'neural.test_data.client.createTestClient',
    sortOrder: 0
}).save()


const deleteTestClient = ()=> Client.deleteMany({
    name: /.*Test Client*./i
}).exec()


const getTestClient = ()=> Client.findOne({
    name: /.*Test Client*./i
}).exec()


//-- Domain Data
const createTestDomain = (urlObj)=> (clientId)=> new Domain({
    client: clientId,
    host: urlObj.host,
    hostname: urlObj.hostname,
    port: urlObj.port,
    protocol: urlObj.protocol,
    origin: urlObj.origin
}).save()
    .then((domain)=>
        Client.findByIdAndUpdate(
            clientId,
            { domains: [domain._id] },
            { new: true }
        )
        .exec()
        .then(()=> domain)
    )


const deleteTestDomain = ()=> Domain.deleteMany({
    host: /.*action_tracker_test*./i
}).exec()


const getTestDomain = ()=> Domain.findOne({
    host: /.*action_tracker_test*./i
}).exec()


//-- All together now
const generateClientTestData = ()=> deleteTestClient()
    .then(deleteTestDomain)
    .then(createTestClient)
    .then(R.prop('_id'))
    .then(createTestDomain(testDomainUrl))


module.exports = {
    createTestClient,
    deleteTestClient,
    getTestClient,
    generateClientTestData,

    getTestDomain,
    deleteTestDomain,
    testDomainUrl
}
