const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Navigation builder
 ************************ */
Util.getNav = async function () {
  let data = []

  try {
    const result = await invModel.getClassifications()
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
 * Classification select list
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
    if (
      classification_id &&
      Number(row.classification_id) === Number(classification_id)
    ) {
      list += " selected"
    }
    list += `>${row.classification_name}</option>`
  })

  list += "</select>"
  return list
}

/* ****************************************
 * Error handler wrapper
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * CLASSIFICATION VALIDATION ✅ REQUIRED
 **************************************** */
Util.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .isAlphanumeric()
    .withMessage("Classification name must be letters and numbers only."),
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
 * INVENTORY VALIDATION (ADD)
 **************************************** */
Util.inventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be 0 or more."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("inv_year").isInt({ min: 1900 }).withMessage("Year must be valid."),
]

Util.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    const classificationList = await Util.buildClassificationList(
      req.body.classification_id
    )

    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body,
    })
  }
  next()
}

/* ****************************************
 * INVENTORY VALIDATION (UPDATE)
 **************************************** */
Util.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    const classificationSelect = await Util.buildClassificationList(
      req.body.classification_id
    )

    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
      nav,
      classificationSelect,
      errors: errors.array(),
      ...req.body,
    })
  }
  next()
}

/* ****************************************
 * ACCOUNT UPDATE VALIDATION
 **************************************** */
Util.accountUpdateRules = () => [
  body("account_firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters."),

  body("account_lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters."),

  body("account_email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address."),
]

Util.checkAccountUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      ...req.body,
    })
  }
  next()
}

/* ****************************************
 * PASSWORD VALIDATION
 **************************************** */
Util.passwordRules = () => [
  body("account_password")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must include a number.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must include a special character."),
]

Util.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await Util.getNav()
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      ...req.body,
    })
  }
  next()
}

/* ****************************************
 * JWT helpers
 **************************************** */
Util.generateToken = (accountData) =>
  jwt.sign(
    {
      account_id: accountData.account_id,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  )

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
 * Login checks
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) return next()
  req.flash("notice", "Please log in.")
  res.redirect("/account/login")
}

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
