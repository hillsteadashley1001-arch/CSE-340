/************************************************************
 * baseController.js — Home controller
 ************************************************************/

const utilities = require("../utilities")

const baseController = {}

/* ****************************************
 * Build Home Page
 **************************************** */
baseController.buildHome = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()

    res.render("index", {
      title: "Home",
      nav,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = baseController
