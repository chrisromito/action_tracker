const express = require('express')
const router = express.Router()

//-- Action Demo Page
router.get('/test', (req, res)=> {
    console.log('Home page')
    const msg = 'Nunjucks message =D'
    return res.render('home.html', {
        message: msg
    })
})

//-- Popover Demo Page
router.get('/popover', (req, res)=> res.render('popover.html'))


// App/API routers
module.exports = {
    router,
    ActionRouter: require('./action'),
    UserRouter: require('./user'),
    PageViewRouter: require('./page_view'),
    NeuralStepRouter: require('./neural_step')
}