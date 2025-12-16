/************************************************************
 * invController.js — Inventory Logic
 ************************************************************/

const invModel = require("../models/inventory-model")
const reviewModel = require("../models/reviews-model")
const utilities = require("../utilities/")

const invController = {}

/* ****************************************
 * Inventory Management View (Admin/Employee)
 **************************************** */
invController.buildManagementView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Public Inventory Entry Point
 **************************************** */
invController.buildInventory = async (req, res, next) => {
  try {
    // Default public view → first classification
    return res.redirect("/inv/type/1")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Inventory by Classification View (Public)
 **************************************** */
invController.buildByClassification = async (req, res, next) => {
  try {
    const classification_id = Number(req.params.classification_id)
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    if (!data || data.length === 0) {
      return res.status(404).render("inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: "<p class='notice'>No vehicles were found for this classification.</p>",
        errors: null,
      })
    }

    const grid = utilities.buildClassificationGrid(data)

    res.render("inventory/classification", {
      title: `${data[0].classification_name} Vehicles`,
      nav,
      grid,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Inventory JSON Endpoint (Management AJAX)
 **************************************** */
invController.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = Number(req.params.classification_id)
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No inventory found." })
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Vehicle Detail View (Public)
 **************************************** */
invController.buildByInvId = async (req, res, next) => {
  try {
    const inv_id = Number(req.params.inv_id)
    const item = await invModel.getInventoryById(inv_id)

    if (!item) {
      return next({ status: 404, message: "Vehicle not found." })
    }

    const nav = await utilities.getNav()
    const reviews = await reviewModel.getReviewByInvId(inv_id)

    res.render("inventory/detail", {
      title: `${item.inv_year} ${item.inv_make} ${item.inv_model}`,
      nav,
      errors: null,
      ...item,
      reviews,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Build Add Classification View
 **************************************** */
invController.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()

    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Add Classification
 **************************************** */
invController.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body
    const nav = await utilities.getNav()

    if (!classification_name || classification_name.trim() === "") {
      req.flash("notice", "Classification name cannot be empty.")
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      })
    }

    const result = await invModel.addClassification(classification_name.trim())

    if (result?.rowCount) {
      req.flash("notice", "Classification added successfully.")
      return res.redirect("/inv/management")
    }

    throw new Error("Insert failed")
  } catch (err) {
    // 👇 HANDLE DUPLICATE CLASSIFICATION
    if (err.code === "23505") {
      req.flash("notice", "That classification already exists.")
      const nav = await utilities.getNav()
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      })
    }

    next(err)
  }
}


/* ****************************************
 * Build Add Inventory View
 **************************************** */
invController.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Add Inventory
 **************************************** */
invController.addInventory = async (req, res, next) => {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body

    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (result) {
      req.flash("notice", "Inventory item added successfully.")
      return res.redirect("/inv/management")
    }

    throw new Error("Insert failed")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Build Edit Inventory View
 **************************************** */
invController.editInventoryView = async (req, res, next) => {
  try {
    const inv_id = Number(req.params.inv_id)
    const item = await invModel.getInventoryById(inv_id)

    if (!item) {
      req.flash("notice", "Inventory item not found.")
      return res.redirect("/inv/management")
    }

    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(item.classification_id)

    res.render("inventory/edit-inventory", {
      title: `Edit ${item.inv_make} ${item.inv_model}`,
      nav,
      classificationSelect,
      errors: null,
      ...item,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Inventory Update
 **************************************** */
invController.updateInventory = async (req, res, next) => {
  try {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    } = req.body

    const result = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    )

    if (result) {
      req.flash("notice", "Inventory item updated successfully.")
      return res.redirect("/inv/management")
    }

    throw new Error("Update failed")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Build Delete Confirmation View
 **************************************** */
invController.buildDeleteConfirm = async (req, res, next) => {
  try {
    const inv_id = Number(req.params.inv_id)
    const item = await invModel.getInventoryById(inv_id)

    if (!item) {
      req.flash("notice", "Inventory item not found.")
      return res.redirect("/inv/management")
    }

    const nav = await utilities.getNav()

    res.render("inventory/delete-confirm", {
      title: `Delete ${item.inv_make} ${item.inv_model}`,
      nav,
      errors: null,
      ...item,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 * Process Delete Inventory Item
 **************************************** */
invController.deleteInventoryItem = async (req, res, next) => {
  try {
    const inv_id = Number(req.body.inv_id)
    const success = await invModel.deleteInventoryItem(inv_id)

    if (success) {
      req.flash("notice", "Inventory item deleted successfully.")
      return res.redirect("/inv/management")
    }

    req.flash("notice", "Delete failed.")
    return res.redirect("/inv/management")
  } catch (err) {
    next(err)
  }
}

module.exports = invController
