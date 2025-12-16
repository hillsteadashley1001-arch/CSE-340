// routes/static.js
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")

/* ****************************************
 * Static / Utility Routes
 **************************************** */

// Intentional error route (for testing 500 handler)
router.get(
  "/error/test",
  utilities.handleErrors(async (req, res) => {
    const error = new Error("Intentional test crash")
    error.status = 500
    throw error
  })
)

module.exports = router
