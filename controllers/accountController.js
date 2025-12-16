/************************************************************
 * accountController.js — Account logic
 ************************************************************/

const accountModel = require("../models/account-model")
const utilities = require("../utilities")
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

    const match = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!match) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    delete accountData.account_password

    const token = utilities.generateToken(accountData)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    })

    res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Account Management View
 **************************************** */
accountController.buildAccountManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("account/account", {
      title: "Account Management",
      nav,
      errors: null,
      account: res.locals.accountData,
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
    const accountData = await accountModel.getAccountById(account_id)

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    const nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      ...accountData,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Update Account Info
 **************************************** */
accountController.updateAccount = async (req, res, next) => {
  try {
    const {
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    } = req.body

    const result = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (!result) {
      req.flash("notice", "Update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }

    req.flash("notice", "Account updated successfully.")
    res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Update Password
 **************************************** */
accountController.updatePassword = async (req, res, next) => {
  try {
    const { account_id, account_password } = req.body
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const result = await accountModel.updatePassword(
      account_id,
      hashedPassword
    )

    if (!result) {
      req.flash("notice", "Password update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }

    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Logout
 **************************************** */
accountController.logout = (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
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

    const result = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (!result) {
      req.flash("notice", "Registration failed.")
      return res.redirect("/account/register")
    }

    req.flash("notice", "Registration successful. Please log in.")
    res.redirect("/account/login")
  } catch (err) {
    next(err)
  }
}

module.exports = accountController
