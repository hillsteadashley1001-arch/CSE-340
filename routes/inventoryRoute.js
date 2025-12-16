/* ****************************************
 * Inventory Routes
 **************************************** */
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const invController = require("../controllers/invController")

/* ============================
 * PUBLIC INVENTORY ENTRY POINT
 * ============================ */
router.get(
  "/",
  utilities.handleErrors(invController.buildInventory)
)

// Public inventory listing
router.get("/", async (req, res) => {
  res.redirect("/inv/type/1")
})

// View inventory by classification (public)
router.get(
  "/type/:classification_id",
  utilities.handleErrors(invController.buildByClassification)
)

// Vehicle detail view (public)
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

/* ============================
 * Inventory Management (protected)
 * ============================ */

router.get(
  "/management",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
)


// Add classification (protected)
router.get(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  utilities.classificationRules(),
  utilities.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ============================
 * Inventory Item Routes
 * ============================ */
// Add inventory (protected)
router.get(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  utilities.inventoryRules(),
  utilities.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// JSON endpoint for AJAX (protected – used in management UI)
router.get(
  "/getInventory/:classification_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Vehicle detail view (public)
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

// Edit inventory item view (protected)
router.get(
  "/edit/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

// Update inventory item (protected)
router.post(
  "/update",
  utilities.checkEmployeeOrAdmin,
  utilities.newInventoryRules(),
  utilities.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete confirmation view (protected)
router.get(
  "/delete/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Process delete inventory item (protected)
router.post(
  "/delete",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router
