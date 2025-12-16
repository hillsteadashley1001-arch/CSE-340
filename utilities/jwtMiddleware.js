/* ************************************************************
 * jwtMiddleware.js — JWT utilities
 ************************************************************ */

const jwt = require("jsonwebtoken")

/* ****************************************
 * Check JWT Token (non-blocking)
 * Runs on ALL requests
 **************************************** */
function checkJWTToken(req, res, next) {
  const token = req.cookies?.jwt

  // No token — just continue
  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // ✅ Sync JWT with session
    req.session.loggedin = true
    req.session.accountData = decoded

    // Make available to views
    res.locals.loggedin = true
    res.locals.accountData = decoded

    next()
  } catch (err) {
    // Invalid or expired token
    res.clearCookie("jwt")
    req.session.destroy(() => {
      res.locals.loggedin = false
      next()
    })
  }
}

/* ****************************************
 * Require Authentication (blocking)
 * Use ONLY on protected routes
 **************************************** */
function requireAuth(req, res, next) {
  // ✅ Prefer session first
  if (req.session.loggedin && req.session.accountData) {
    res.locals.loggedin = true
    res.locals.accountData = req.session.accountData
    return next()
  }

  const token = req.cookies?.jwt

  if (!token) {
    req.flash("notice", "Please log in to access that page.")
    return res.redirect("/account/login")
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("jwt")
      req.session.destroy(() => {
        req.flash("notice", "Your session has expired. Please log in again.")
        res.redirect("/account/login")
      })
      return
    }

    // Restore session from JWT
    req.session.loggedin = true
    req.session.accountData = decoded

    res.locals.loggedin = true
    res.locals.accountData = decoded

    next()
  })
}

module.exports = {
  checkJWTToken,
  requireAuth,
}
