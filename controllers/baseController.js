// controllers/baseController.js
const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();

    // set flash BEFORE rendering (optional)
    req.flash("notice", "This is a flash message.");

    // read flashes if you want to display them
    const notices = req.flash("notice"); // array, often take first or pass whole array

    // send exactly once, and return
    return res.render("index", {
      title: "Home",
      nav,
      errors: null,
      notices, // e.g., use in your EJS: <%= notices && notices[0] %>
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = baseController;