/*
*********************************************************************
* This server.js file is the primary file of the application.
* It is used to control the project.
*********************************************************************
*/

/* ***********************
 * Require Statements
 *************************/
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()

const app = express()

const staticRoutes = require('./routes/static')
const baseController = require('./controllers/baseController')
const inventoryRoute = require('./routes/inventoryRoute')
const accountRoute = require('./routes/accountRoute')
const utilities = require('./utilities/')

const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const db = require('./database/') // Exports { query, pool }

/* ***********************
 * Security and Proxy
 *************************/
if (process.env.NODE_ENV !== 'development') {
	app.set('trust proxy', 1) // needed for secure cookies behind proxies like Render/Heroku
}

/* ***********************
 * Sessions and Flash
 *************************/
app.use(session({

store: new pgSession({

createTableIfMissing: true,

pool: db.pool, // use Pool, not a URL

}),

secret: process.env.SESSION_SECRET,

resave: true,

saveUninitialized: true,

name: 'sessionId',

cookie: {

secure: process.env.NODE_ENV !== 'development',

httpOnly: true,

sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',

},

}))

// Flash messages
app.use(require('connect-flash')())
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res)
	next()
})

/* ***********************
 * Body Parsing
 *************************/
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))
app.get('/favicon.ico', (_req, res) => res.status(204).end())
/* ***********************
 * Static Assets
 *************************/
// If your routes/static already serves public assets, keep using it.
// Otherwise uncomment the line below:
// app.use(express.static('public'))

/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout') // not at views root

app.use(async (req, res, next) => {
  try {
    const utilities = require('./utilities/')
    res.locals.nav = await utilities.getNav()
    next()
  } catch (err) {
    next(err)
  }
})

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)

// Index Route
app.get('/', utilities.handleErrors(baseController.buildHome))

// Inventory Routes (includes /inv/error for intentional 500)
app.use('/inv', inventoryRoute)

// Account Routes
app.use('/account', accountRoute)

/* ***************************************************************
 * 404 Handler — must be before the general error handler and last
 * non-error middleware
 *****************************************************************/
app.use((req, res) => {
	res.status(404).render('errors/error', {
		title: 'Not Found',
		status: 404,
		message: 'The page you requested was not found.',
	})
})

/* ***************************************************************
 * General Error Handler (500 and others) — must be last
 *****************************************************************/
app.use((err, req, res, next) => {
	console.error(err)
	const status = err.status || 500
	res.status(status).render('errors/error', {
		title: status === 500 ? 'Server Error' : 'Error',
		status,
		message:
			status === 500
				? 'Something went wrong on the server.'
				: err.message || 'An error occurred.',
	})
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
	console.log(`app listening on ${host}:${port}`)
})
