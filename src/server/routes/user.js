const Router = require('express').Router
const user = require('../controllers/user')


const UserRouter = Router()

UserRouter.get('/user', user.userList)
UserRouter.get('/user/:userId', user.userDetail)


module.exports = UserRouter