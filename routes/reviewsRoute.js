// routes/reviewRoute.js
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const reviewController = require("../controllers/reviewController")

/* ******************************
 * Review Routes (Protected)
 * ****************************** */

// Add new review (logged-in users only)
router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.addReview)
)

// Build edit review view (author only)
router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
)

// Process review update (author only)
router.post(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.updateReview)
)

// Process review deletion (author only)
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
