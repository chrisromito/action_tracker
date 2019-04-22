const { Router } = require('express')
const PageViewController = require('../controllers/page_view/page_view')

const PageViewRouter = Router()

PageViewRouter.get('/page_view', PageViewController.PageViewCharts)
PageViewRouter.get('/api/page_view', PageViewController.PageViewList)
PageViewRouter.post('/api/page_view', PageViewController.PageViewPost)

module.exports = PageViewRouter