/*************************************************************
 * server.js — Application Entry Point
 *************************************************************/

/* =======================
 * Dependencies
 * ======================= */
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")
const messages = require("express-messages")
require("dotenv").config()

/* =======================
 * Local Modules
 * ======================= */
const db = require("./database")
const utilities = require("./utilities")

/* Routes / Controllers */
const staticRoutes = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const baseController = require("./controllers/baseController")

/* =======================
 * App Initialization
 * ======================= */
const app = express()

/* =======================
 * Proxy Trust (Railway / Render)
 * ======================= */
if (process.env.NODE_ENV !== "development") {
  app.set("trust proxy", 1)
}

/* =======================
 * Session Configuration
 * ======================= */
app.use(
  session({
    store: new pgSession({
      pool: db.pool,
      createTableIfMissing: true,
    }),
    name: "cse340.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
)

/* =======================
 * Flash Messages
 * ======================= */
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = messages(req, res)
  next()
})

/* =======================
 * Body & Cookie Parsing
 * ======================= */
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* =======================
 * Static Assets
 * ======================= */
app.use(express.static("public"))
app.get("/favicon.ico", (_req, res) => res.sendStatus(204))

/* =======================
 * View Engine (EJS)
 * ======================= */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* =======================
 * Default Template Locals
 * ======================= */
app.use((req, res, next) => {
  res.locals.loggedin = false
  res.locals.accountData = null
  res.locals.nav = ""
  next()
})

/* =======================
 * JWT Authentication
 * ======================= */
app.use(utilities.checkJWTToken)

/* =======================
 * Routes
 * ======================= */
app.use(staticRoutes)
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

app.get(
  "/",
  utilities.handleErrors(baseController.buildHome)
)

/* =======================
 * 404 Handler
 * ======================= */
app.use((req, _res, next) => {
  next({
    status: 404,
    message: "Sorry, we appear to have lost that page.",
  })
})

/* =======================
 * Global Error Handler
 * ======================= */
app.use(async (err, req, res, _next) => {
  console.error(`Error at "${req.originalUrl}": ${err.message}`)

  const status = err.status || 500
  const message =
    status === 404
      ? err.message
      : "Oh no! Something went wrong. Please try again later."

  res.status(status).render("errors/error", {
    title: status === 404 ? "Page Not Found" : "Server Error",
    message,
    nav: res.locals.nav,
  })
})

/* =======================
 * Server Startup
 * ======================= */
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`🚀 Server running at http://${host}:${port}`)
})
