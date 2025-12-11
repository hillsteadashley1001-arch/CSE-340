// routes/inventoryRoute.js

// Needed Resources
const express = require('express')
const router = new express.Router()

// Controllers and utilities
const invController = require('../controllers/invController')
const utilities = require('../utilities/')

// Validation middleware (implement these in validators/inventoryValidators.js)
const {
	validateClassification,
	validateInventory,
} = require('../utilities/inventory-validation')

// -----------------------------------------------------------------------------
// Existing routes (keep)
// -----------------------------------------------------------------------------

// Build inventory by classification view
router.get(
	'/type/:classificationId',
	utilities.handleErrors(invController.buildByClassificationId)
)

// Build inventory detail view
router.get(
	'/detail/:invId',
	utilities.handleErrors(invController.buildInvDetail)
)

// Error test route
router.get('/error', utilities.handleErrors(invController.errorRoute))

// -----------------------------------------------------------------------------
// Assignment routes
// -----------------------------------------------------------------------------

// Task 1: Management view (access via direct URL only: /inv/)
router.get('/', utilities.handleErrors(invController.managementView))

// Task 2: Add Classification (GET form + POST process)
router.get(
	'/add-classification',
	utilities.handleErrors(invController.classificationForm)
)
router.post(
	'/add-classification',
	validateClassification, // server-side validation
	utilities.handleErrors(invController.addClassification)
)

// Back-compat for your original route names (optional; remove if not needed)
router.get(
	'/newClassification',
	(req, res) => res.redirect(301, '/inv/add-classification')
)
router.post(
	'/addClassification',
	validateClassification,
	utilities.handleErrors(invController.addClassification)
)

// Task 3: Add Inventory (GET form + POST process)
router.get(
	'/add-inventory',
	utilities.handleErrors(invController.vehicleForm) // controller should render the add-inventory form
)
router.post(
	'/add-inventory',
	validateInventory, // server-side validation
	utilities.handleErrors(invController.addInventory) // implement in controller
)

// Back-compat for your original route name (optional; remove if not needed)
router.get('/newVehicle', (req, res) => res.redirect(301, '/inv/add-inventory'))

// Intentional error route (500)
router.get(
	'/error',
	utilities.handleErrors(invController.errorRoute)
)

module.exports = router