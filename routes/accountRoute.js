// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

// Route to show login form
router.get("/login", utilities.handleErrors(accountController.buildLogin));

//Route to show registration form
router.get("/register", utilities.handleErrors(accountController.buildRegister));

//Route to process user registration
router.post("/register", utilities.handleErrors(accountController.registerAccount));

module.exports = router;