// routes/reviewRoute.js
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const reviewController = require("../controllers/reviewController")

/* ============================
 * Review Routes (protected)
 * ============================ */

// Add new review (logged in users only)
router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.addReview)
)

// Edit review view (author only)
router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
)

// Update review (author only)
router.post(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.updateReview)
)

// Delete review (author only)
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
