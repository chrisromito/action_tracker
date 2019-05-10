const { Router } = require('express')
const Controller = require('../../controllers/api/page_view')

const PageViewRouter = Router()

PageViewRouter.get('/', Controller.PageViewList)
PageViewRouter.post('/', Controller.PageViewPost)
PageViewRouter.get('/:pageViewId', Controller.PageViewDetail)
PageViewRouter.get('/chart', Controller.PageViewCharts)

module.exports = PageViewRouter