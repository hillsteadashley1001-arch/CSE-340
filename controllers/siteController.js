// controllers/siteController.js
const utils = require("../utilities");

/**
 * GET /
 * Simple home page (adjust to your layout/routes as needed)
 */
const buildHome = utils.asyncHandler(async (req, res) => {
  res.render("index", {
    title: "Home",
    nav: res.locals.nav,
  });
});

/**
 * GET /cause-error
 * Intentional 500 error for assignment testing (Task 3)
 */
const triggerServerError = utils.asyncHandler(async (req, res) => {
  const err = new Error("Intentional server failure for testing.");
  err.status = 500;
  throw err;
});

module.exports = {
  buildHome,
  triggerServerError,
};