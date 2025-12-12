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
