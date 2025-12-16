// controllers/reviewController.js
const reviewModel = require("../models/reviews-model")
const utilities = require("../utilities")

const reviewController = {}

/* ***************************
 * Add a new review (POST)
 * ************************** */
reviewController.addReview = async function (req, res, next) {
  const { review_text, inv_id, account_id } = req.body
  try {
    if (!review_text || !inv_id || !account_id) {
      req.flash("notice", "Please provide review text.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }
    await reviewModel.addReview(review_text.trim(), parseInt(inv_id), parseInt(account_id))
    req.flash("notice", "Review added.")
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (err) {
    next(err)
  }
}

/* ***************************
 * Deliver review edit view (GET)
 * ************************** */
reviewController.buildEditReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const nav = await utilities.getNav()
  const review = await reviewModel.getReviewById(review_id)
  // Authorization: only author can edit
  if (res.locals.accountData?.account_id !== review.account_id) {
    req.flash("notice", "You can only edit your own review.")
    return res.redirect("/account/")
  }
  res.render("review/edit-review", {
    title: "Edit Review",
    nav,
    errors: null,
    review_id: review.review_id,
    inv_id: review.inv_id,
    review_text: review.review_text,
  })
}

/* ***************************
 * Process review update (POST)
 * ************************** */
reviewController.updateReview = async function (req, res, next) {
  const { review_id, inv_id, review_text } = req.body
  try {
    // Authorization: only author can update
    const current = await reviewModel.getReviewById(parseInt(review_id))
    if (res.locals.accountData?.account_id !== current.account_id) {
      req.flash("notice", "You can only update your own review.")
      return res.redirect("/account/")
    }
    if (!review_text || review_text.trim().length < 3) {
      req.flash("notice", "Review must be at least 3 characters.")
      return res.redirect(`/review/edit/${review_id}`)
    }
    const updated = await reviewModel.updateReview(parseInt(review_id), review_text.trim())
    if (updated > 0) {
      req.flash("notice", "Review updated.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Update failed.")
      return res.redirect(`/review/edit/${review_id}`)
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 * Process review delete (POST)
 * ************************** */
reviewController.deleteReview = async function (req, res, next) {
  const { review_id } = req.body
  try {
    const existing = await reviewModel.getReviewById(parseInt(review_id))
    // Authorization: only author can delete
    if (res.locals.accountData?.account_id !== existing.account_id) {
      req.flash("notice", "You can only delete your own review.")
      return res.redirect("/account/")
    }
    const deleted = await reviewModel.deleteReview(parseInt(review_id))
    if (deleted > 0) {
      req.flash("notice", "Review deleted.")
    } else {
      req.flash("notice", "Delete failed.")
    }
    return res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}

module.exports = reviewController
