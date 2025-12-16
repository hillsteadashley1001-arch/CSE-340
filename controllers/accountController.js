/* ************************************************************
 * accountController.js — Account logic
 ************************************************************ */

const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")

const accountController = {}

/* ****************************************
 * Build Login View
 **************************************** */
accountController.buildLogin = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Login
 **************************************** */
accountController.accountLogin = async (req, res, next) => {
  try {
    const { account_email, account_password } = req.body

    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!passwordMatch) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    // remove password before storing
    delete accountData.account_password

    // ✅ SET SESSION FLAGS (THIS WAS MISSING)
    req.session.loggedin = true
    req.session.accountData = accountData

    // JWT (optional but kept for your setup)
    const token = utilities.generateToken(accountData)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 3600000,
    })

    return res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Build Account Management View
 **************************************** */
accountController.buildAccountManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("account/account", {
      title: "Account Management",
      nav,
      errors: null,
      account: req.session.accountData,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Build Update Account View
 **************************************** */
accountController.buildUpdateAccount = async (req, res, next) => {
  try {
    const account_id = Number(req.params.account_id)
    const nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Account Info Update
 **************************************** */
accountController.updateAccount = async (req, res, next) => {
  try {
    const {
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    } = req.body

    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (!updateResult) {
      req.flash("notice", "Sorry, the update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }

    // update session data
    req.session.accountData.account_firstname = account_firstname
    req.session.accountData.account_lastname = account_lastname
    req.session.accountData.account_email = account_email

    req.flash("notice", "Account information updated successfully.")
    return res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Password Change
 **************************************** */
accountController.updatePassword = async (req, res, next) => {
  try {
    const { account_id, account_password } = req.body

    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    )

    if (!updateResult) {
      req.flash("notice", "Sorry, the password update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }

    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Logout
 **************************************** */
accountController.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("jwt")
    res.redirect("/")
  })
}

/* ****************************************
 * Build Register View
 **************************************** */
accountController.buildRegister = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Registration
 **************************************** */
accountController.registerAccount = async (req, res, next) => {
  try {
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body

    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (!regResult) {
      req.flash("notice", "Registration failed.")
      return res.redirect("/account/register")
    }

    req.flash("notice", "Registration successful. Please log in.")
    return res.redirect("/account/login")
  } catch (err) {
    next(err)
  }
}

module.exports = accountController
