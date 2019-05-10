const express = require('express')
const router = express.Router()

// Routers
const api = require('./api/index')
const UserRouter = require('./user')
const ActionRouter = require('./action')
const NeuralStepRouter = require('./neural_step')

router.use('/', api)
router.use('/', UserRouter)
router.use('/action', ActionRouter)
router.use('/neural_step', NeuralStepRouter)

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
module.exports = router