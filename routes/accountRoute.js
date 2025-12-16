const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

/* ****************************************
 * Login routes
 **************************************** */
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

router.post(
  "/login",
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
 * Register routes
 **************************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************************
 * Account management (protected)
 **************************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ****************************************
 * Update account information (protected)
 **************************************** */
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

router.post(
  "/update",
  utilities.checkLogin,
  utilities.accountUpdateRules(),
  utilities.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ****************************************
 * Update password (protected)
 **************************************** */
router.post(
  "/update-password",
  utilities.checkLogin,
  utilities.passwordRules(),
  utilities.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

/* ****************************************
 * Logout
 **************************************** */
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
)

module.exports = router
