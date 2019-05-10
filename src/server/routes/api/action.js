
/**
 * HTTP Implementation
 * routes:
 *    /action - POST - Create an instance of an action
 *    /action/user - POST - Update/Create User & UserSession * 
 */
const {Router} = require('express')
const action = require('../../controllers/api/action')

const socketContext = action.socketContext

const ActionRouter = Router()


ActionRouter.get('/', action.actionList)

ActionRouter.post('/user', (req, res)=> {
    return action.onOpen(socketContext(undefined, req))
        .then(res.send)
})

ActionRouter.post('/', (req, res)=> {
    return action.createAction(socketContext(undefined, req), JSON.parse(req.body))
        .then(res.send)
})


module.exports = ActionRouter