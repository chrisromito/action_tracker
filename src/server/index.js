const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const csrf = require('csurf')
const cors = require('cors')
const nunjucks = require('nunjucks')
const MongoDBStore = require('connect-mongodb-session')(session)


//-- Constants
const IS_DEV = process.env.NODE_ENV !== 'production';


//-- Pre-app middleware
const { DB_URL } = require('./models/index')


//-- App Setup
const app = express()
const expressWs = require('express-ws')
const socket = expressWs(app)


//-- Routes
const routes = require('./routes/index')
app.use(express.static('dist'))
app.use(express.static('static'))


//-- Nunjucks (templating)
const nunjucksContext = require('./middleware/nunjucks.context')
const nunjucksEnv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader('src/server/views/', {
        watch: true
    })
)

nunjucksEnv.express(app)
nunjucksContext(nunjucksEnv)


/** Cookies/sessions, request parsing, url encoding, etc
 * @see https://www.codementor.io/mayowa.a/how-to-build-a-simple-session-based-authentication-system-with-nodejs-from-scratch-6vn67mcy3
 */
app.use(bodyParser.json())
// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({
    extended: false
}))
// initialize cookie-parser to allow us access the cookies stored in the browser.

app.use(cookieParser())

app.use(csrf({
    cookie: true
}))




const sessionStore = new MongoDBStore({
    uri: DB_URL,
    collection: 'sessions'
})

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    // key: 'user_sid',
    // FIXME: Add a Real Secret Key here!!!
    secret: 'eiofajoewjfowa',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        expires: 600000,
        secure: !IS_DEV
    }
}))



// If a user's cookie is still saved in browser, but user
// is not set, then log them out
app.use((req, res, next)=> {
    if (req.cookies['connect.sid'] && (!req.session || !req.session.user)) {
        return res.clearCookie('connect.sid')
    }
    next()
})


// //-- User/Session middleware
// const loginMiddleware = require('./middleware/login')

// app.use(loginMiddleware())


// Add csrfToken to the nunjucks context
app.use((req, res, next)=> {
    nunjucksEnv.addGlobal('csrfToken', req.csrfToken())
    next()
})



/**  Routes 
 *==============================*/
app.use('/', routes.router)
app.use('/', routes.ActionRouter)
app.use('/', routes.UserRouter)
app.use('/', routes.PageViewRouter)
app.use('/', routes.NeuralStepRouter)



app.use(function(err, req, res, next) {
    console.log(`\n\n\nHit an error: ${err}\n\n\n`)
    return res.send(String(err))
})


app.set('view engine', 'html')

const port = process.env.PORT

const appPort = !port || port === '' ? 8080 : port

app.listen(appPort, () => console.log(`Listening on port ${appPort}`))
