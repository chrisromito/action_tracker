const express = require('express')
const router = express.Router()

router.get('/test', (req, res)=> {
    console.log('Home page')
    const msg = 'Nunjucks message =D'
    return res.render('home.html', {
        message: msg
    })
})


module.exports.router = router
module.exports.ActionRouter = require('./action')
module.exports.UserRouter = require('./user')