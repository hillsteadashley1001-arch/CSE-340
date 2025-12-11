// controllers/invController.js

const { validationResult } = require('express-validator')
const invModel = require('../models/inventory-model')
const utilities = require('../utilities/')

const invCont = {}

/************************************
 * Build inventory by classification view
 ************************************/
invCont.buildByClassificationId = async function (req, res, next) {
	const classification_id = req.params.classificationId
	const data = await invModel.getInventoryByClassificationId(classification_id)
	let nav = await utilities.getNav()
	const grid = await utilities.buildClassificationGrid(data)

	// Derive a human title even if there are no vehicles in that class
	let className = data?.[0]?.classification_name
	if (!className) {
		const classes = await invModel.getClassifications()
		className =
			classes.rows.find(
				(r) => String(r.classification_id) === String(classification_id)
			)?.classification_name || 'Classification'
	}

	return res.render('./inventory/classification', {
		title: `${className} vehicles`,
		nav,
		grid,
		errors: null,
	})
}

/************************************
 * Build inventory detail view
 ************************************/
invCont.buildInvDetail = async function (req, res, next) {
	const inv_id = req.params.invId
	const data = await invModel.getInvById(inv_id)
	let nav = await utilities.getNav()

	if (!data) {
		req.flash('notice', 'Vehicle not found.')
		return res.status(404).render('./inventory/detail', {
			title: 'Vehicle not found',
			nav,
			detail: '<p class="notice">No vehicle found.</p>',
			errors: null,
		})
	}

	const detail = await utilities.buildInvDetail(data)
	const title = `${data.inv_make} ${data.inv_model}`

	return res.render('./inventory/detail', {
		title,
		nav,
		detail,
		errors: null,
	})
}

/************************************
 * Management view (Task 1)
 ************************************/
invCont.managementView = async function (req, res, next) {
	let nav = await utilities.getNav()
	return res.render('inventory/management', {
		title: 'Inventory Management',
		nav,
		errors: null,
	})
}

/************************************
 * GET: Add Classification form (Task 2)
 * - Sticky form + server-side error display
 ************************************/
invCont.classificationForm = async function (req, res, next) {
	let nav = await utilities.getNav()
	const sticky = req.session?.formData || {}
	const formErrors = req.session?.formErrors || {}

	res.render('inventory/add-classification', {
		title: 'Add New Classification',
		nav,
		errors: formErrors,
		classification_name: sticky.classification_name || '',
	})

	// Clear one-time sticky/error data
	req.session.formData = null
	req.session.formErrors = null
}

/************************************
 * POST: Add Classification (Task 2)
 * - Uses express-validator
 * - Sticky + flash on error
 ************************************/
invCont.addClassification = async function (req, res, next) {
	const { classification_name } = req.body
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		req.session.formData = { classification_name }
		req.session.formErrors = errors.mapped()
		req.flash('notice', 'Please correct the errors and try again.')
		return res.redirect('/inv/add-classification')
	}

	try {
		const result = await invModel.addClassification(classification_name)
		if (result) {
			req.flash(
				'notice',
				`Classification ${classification_name} was successfully added.`
			)
			// Redirect so nav is rebuilt on render and shows the new classification
			return res.redirect('/inv/')
		}
		// Fallback: insertion returned null/undefined
		req.session.formData = { classification_name }
		req.flash('notice', 'Sorry, the classification was not added.')
		return res.status(501).redirect('/inv/add-classification')
	} catch (e) {
		// Likely unique constraint or DB failure
		req.session.formData = { classification_name }
		req.flash('notice', 'That classification already exists or could not be added.')
		return res.status(400).redirect('/inv/add-classification')
	}
}

/************************************
 * GET: Add Inventory form (Task 3)
 * - Builds classification <select> with stickiness
 * - Sticky values for all fields
 ************************************/
invCont.vehicleForm = async function (req, res, next) {
	let nav = await utilities.getNav()
	const sticky = req.session?.formData || {}
	const formErrors = req.session?.formErrors || {}

	const classificationList = await utilities.buildClassificationList(
		sticky.classification_id ?? null
	)

	res.render('inventory/add-vehicle', {
		title: 'Add New Vehicle',
		nav,
		errors: formErrors,
		classificationList,

		// Sticky values
		inv_make: sticky.inv_make || '',
		inv_model: sticky.inv_model || '',
		inv_year: sticky.inv_year || '',
		inv_description: sticky.inv_description || '',
		inv_image: sticky.inv_image || '/images/vehicles/no-image.png',
		inv_thumbnail: sticky.inv_thumbnail || '/images/vehicles/no-image-tn.png',
		inv_price: sticky.inv_price || '',
		inv_miles: sticky.inv_miles || '',
		inv_color: sticky.inv_color || '',
		classification_id: sticky.classification_id || '',
	})

	// Clear one-time sticky/error data
	req.session.formData = null
	req.session.formErrors = null
}

/************************************
 * POST: Add Inventory (Task 3)
 * - Uses express-validator
 * - Sticky + flash on error
 ************************************/
invCont.addInventory = async function (req, res, next) {
	const errors = validationResult(req)

	// Coerce numbers to ensure correct types reach the model
	const payload = {
		classification_id: Number(req.body.classification_id),
		inv_make: req.body.inv_make,
		inv_model: req.body.inv_model,
		inv_year: Number(req.body.inv_year),
		inv_description: req.body.inv_description,
		inv_image: req.body.inv_image || '/images/vehicles/no-image.png',
		inv_thumbnail: req.body.inv_thumbnail || '/images/vehicles/no-image-tn.png',
		inv_price: Number(req.body.inv_price),
		inv_miles: Number(req.body.inv_miles),
		inv_color: req.body.inv_color,
	}

	if (!errors.isEmpty()) {
		req.session.formData = payload
		req.session.formErrors = errors.mapped()
		req.flash('notice', 'Please correct the errors and try again.')
		return res.redirect('/inv/add-inventory')
	}

	const result = await invModel.addInventory(payload)
	if (result) {
		req.flash('notice', 'Inventory item was successfully added.')
		return res.redirect('/inv/')
	} else {
		req.session.formData = payload
		req.flash('notice', 'Sorry, the inventory item was not added.')
		return res.status(501).redirect('/inv/add-inventory')
	}
}

/************************************
 * Intentional 500 error trigger (for testing)
 ************************************/
invCont.errorRoute = async function (req, res, next) {
	// The route wrapper (utilities.handleErrors) will funnel this to the error middleware
	throw new Error('Intentional test error: simulating a server failure')
}

module.exports = invCont