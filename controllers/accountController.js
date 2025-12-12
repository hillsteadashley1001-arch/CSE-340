<<<<<<< HEAD
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver Registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }
=======
// controllers/accountController.js
const utilities = require('../utilities/')
const accountModel = require('../models/account-model')

/*****************************************
 * Deliver login view
 *****************************************/
async function buildLogin(req, res, next) {
  try {
    // nav is already in res.locals via global middleware
    return res.render('account/login', {
      title: 'Login',
      errors: null,
    })
  } catch (err) {
    return next(err)
  }
}

/*****************************************
 * Deliver registration view
 *****************************************/
async function buildRegister(req, res, next) {
  try {
    return res.render('account/register', {
      title: 'Register',
      errors: null,
    })
  } catch (err) {
    return next(err)
  }
}

/*****************************************
 * Process registration
 *****************************************/
async function registerAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )

    if (regResult) {
      req.flash('notice', `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.status(201).render('account/login', {
        title: 'Login',
      })
    } else {
      req.flash('notice', 'Sorry, the registration failed.')
      return res.status(501).render('account/register', {
        title: 'Registration',
        errors: null,
      })
    }
  } catch (err) {
    return next(err)
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }
>>>>>>> b3b369d7dbc405228009bcb94f127bd9a00b1120
