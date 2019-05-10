const { Router } = require('express')
const ActionRouter = require('./action')
const PageViewRouter = require('./page_view')


const api = Router()

api.use('/api/action', ActionRouter)
api.use('/api/page_view', PageViewRouter)

module.exports = api