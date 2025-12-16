const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Navigation builder (SAFE)
 ************************ */
Util.getNav = async function () {
  let data = []

  try {
    const result = await invModel.getClassifications()
    // Works whether model returns rows OR array
    data = Array.isArray(result) ? result : result?.rows || []
  } catch (error) {
    console.error("getNav error:", error.message)
  }

  let nav = "<ul>"
  nav += '<li><a href="/" title="Home page">Home</a></li>'

  data.forEach((row) => {
    nav += `
      <li>
        <a href="/inv/type/${row.classification_id}"
           title="See ${row.classification_name}">
           ${row.classification_name}
        </a>
      </li>`
  })

  nav += "</ul>"
  return nav
}

/* **************************************
 * Build classification select list (SAFE)
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = []

  try {
    const result = await invModel.getClassifications()
    data = Array.isArray(result) ? result : result?.rows || []
  } catch (error) {
    console.error("buildClassificationList error:", error.message)
  }

  let list = `<select name="classification_id" id="classificationList" required>`
  list += `<option value="">Choose a Classification</option>`

  data.forEach((row) => {
    list += `<option value="${row.classification_id}"`
    if (classification_id && Number(row.classification_id) === Number(classification_id)) {
      list += " selected"
    }
    list += `>${row.classification_name}</option>`
  })

  list += "</select>"
  return list
}

/* ****************************************
 * Build inventory grid
 **************************************** */
Util.buildClassificationGrid = function (data) {
  let grid = '<ul id="inv-display">'

  if (Array.isArray(data) && data.length > 0) {
    data.forEach((vehicle) => {
      grid += `
        <li>
          <a href="/inv/detail/${vehicle.inv_id}">
            <img src="${vehicle.inv_thumbnail}"
                 alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
          </a>
          <div class="namePrice">
            <h2>
              <a href="/inv/detail/${vehicle.inv_id}">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>$${new Intl.NumberFormat().format(vehicle.inv_price)}</span>
          </div>
        </li>`
    })
  } else {
    grid += `<li class="no-vehicles">Sorry, no vehicles could be found.</li>`
  }

  grid += "</ul>"
  return grid
}

/* ****************************************
 * Error handler wrapper
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Classification validation
 **************************************** */
Util.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .isAlphanumeric()
    .withMessage("Classification name must contain only letters and numbers."),
]

Util.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
    })
  }
  next()
}

/* ****************************************
 * Inventory validation (add)
 **************************************** */
Util.inventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Please choose a classification."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be positive."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Mileage must be non-negative."),
]

Util.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    const classificationList = await Util.buildClassificationList(req.body.classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      ...req.body,
      errors: errors.array(),
    })
  }
  next()
}

/* ****************************************
 * Inventory validation (update)
 **************************************** */
Util.newInventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Please choose a classification."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900 }).withMessage("Year must be valid."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be positive."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Mileage must be non-negative."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
]

Util.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    const classificationSelect = await Util.buildClassificationList(req.body.classification_id)
    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
      nav,
      classificationSelect,
      ...req.body,
      errors: errors.array(),
    })
  }
  next()
}

/* ****************************************
 * JWT token generator
 **************************************** */
Util.generateToken = (accountData) => {
  return jwt.sign(
    {
      account_id: accountData.account_id,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  )
}

/* ****************************************
 * JWT middleware
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies?.jwt

  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("jwt")
      res.locals.loggedin = false
      return next()
    }

    res.locals.accountData = decoded
    res.locals.loggedin = true
    next()
  })
}

/* ****************************************
 * Login check
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) return next()
  req.flash("notice", "Please log in.")
  res.redirect("/account/login")
}

/* ****************************************
 * Employee/Admin authorization
 **************************************** */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  if (
    res.locals.loggedin &&
    ["Employee", "Admin"].includes(res.locals.accountData.account_type)
  ) {
    return next()
  }

  req.flash("notice", "Employee or Admin access required.")
  res.redirect("/account/login")
}

module.exports = Util
