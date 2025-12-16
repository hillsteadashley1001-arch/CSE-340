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
accountController.buildLogin = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 * Process Login
 **************************************** */
accountController.accountLogin = async (req, res) => {
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

  delete accountData.account_password

  const token = utilities.generateToken(accountData)

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
    maxAge: 1000 * 60 * 60, // 1 hour
  })

  res.redirect("/account/")
}

/* ****************************************
 * Account Management View
 **************************************** */
accountController.buildAccountManagement = async (req, res) => {
  const nav = await utilities.getNav()

  res.render("account/account", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData,
    errors: null,
  })
}

/* ****************************************
 * Build Update Account View
 **************************************** */
accountController.buildUpdateAccount = async (req, res) => {
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
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
 * Update Account Info (SERVER-SIDE VALIDATION)
 **************************************** */
accountController.updateAccount = async (req, res) => {
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
    const nav = await utilities.getNav()
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: [{ msg: "Account update failed." }],
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  req.flash("notice", "Account updated successfully.")
  res.redirect("/account/")
}

/* ****************************************
 * Update Password (SERVER-SIDE VALIDATION)
 **************************************** */
accountController.updatePassword = async (req, res) => {
  const { account_id, account_password } = req.body

  const hashedPassword = await bcrypt.hash(account_password, 10)

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  )

  if (!updateResult) {
    req.flash("notice", "Password update failed.")
    return res.redirect(`/account/update/${account_id}`)
  }

  req.flash("notice", "Password updated successfully.")
  res.redirect("/account/")
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
accountController.buildRegister = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 * Process Registration
 **************************************** */
accountController.registerAccount = async (req, res) => {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  const hashedPassword = await bcrypt.hash(account_password, 10)

  const registerResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (!registerResult) {
    req.flash("notice", "Registration failed.")
    return res.redirect("/account/register")
  }

  req.flash("notice", "Registration successful. Please log in.")
  res.redirect("/account/login")
}

module.exports = accountController
