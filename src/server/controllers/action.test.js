const Maybe = require('maybe')
const R = require('ramda')
const toPromise = require('../utils/to_promise').toPromise
const _modelIndex = require('../models/index')
const User = _modelIndex.User
const UserSession = _modelIndex.UserSession
const Action = _modelIndex.Action


//-- Module we're testing
const actionModule = require('./action')

const createAction = actionModule.createAction
const socketContext = actionModule.socketContext

const onOpen = actionModule.onOpen
const onClose = actionModule.onClose




//-- Generic test data
const tryToJson = R.tryCatch(JSON.stringify, String)

const emptyObj = {}


const mockRequest = (data=emptyObj)=> R.mergeDeepRight({
    session: {
        session_id: null,
        user_id: null
    }
}, data)


const mockContext = (data=emptyObj)=> socketContext(null, mockRequest(data))


exports.testOnOpen = ()=> {
    console.log('Testing onOpen...')
    const context = mockContext()
    const data = onOpen(context)

    console.log(`
        onOpen gave us: ${tryToJson(data)}
    `)

    return {
        context: context,
        data: data
    }
}


exports.testCreateAction = ()=> {

    console.log('Testing createAction...')
    const context = mockContext()
    const data = createAction(context)

    console.log(`
        createAction gave us: ${tryToJson(data)}
    `)
    return {
        context: context,
        data: data
    }
}




let copy_paste = `

var testAction = require('./src/server/controllers/action.test')
var onOpen = testAction.testOnOpen

var createAction = testAction.testCreateAction


var actionId = '5c5f7cfd4949ab48b99000cf'
var models = require('./src/server/models/index')
var Action = models.Action
var User = models.User

`