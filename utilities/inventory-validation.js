// validators/inventory-validation.js
const { body } = require('express-validator')

/*
  Classification validation:
  - Required
  - Only letters, numbers, underscore (no spaces or special chars)
*/
const validateClassification = [
	body('classification_name')
		.exists({ checkFalsy: true })
		.withMessage('Classification name is required.')
		.bail()
		.trim()
		.matches(/^[A-Za-z0-9_]+$/)
		.withMessage('Use only letters, numbers, or underscore. No spaces or special characters.')
]

/*
  Inventory validation:
  - classification_id: required int
  - inv_make, inv_model, inv_description, inv_color: required strings
  - inv_year: integer 1900–2100
  - inv_price: float >= 0
  - inv_miles: int >= 0
  - inv_image, inv_thumbnail: path-like strings (allow / . _ -)
*/
const validateInventory = [
	body('classification_id')
		.exists({ checkFalsy: true })
		.withMessage('Classification is required.')
		.bail()
		.toInt()
		.isInt({ min: 1 })
		.withMessage('Classification must be a valid id.'),

	body('inv_make')
		.exists({ checkFalsy: true })
		.withMessage('Make is required.')
		.bail()
		.trim()
		.escape(),

	body('inv_model')
		.exists({ checkFalsy: true })
		.withMessage('Model is required.')
		.bail()
		.trim()
		.escape(),

	body('inv_description')
		.exists({ checkFalsy: true })
		.withMessage('Description is required.')
		.bail()
		.trim()
		.escape(),

	body('inv_year')
		.exists({ checkFalsy: true })
		.withMessage('Year is required.')
		.bail()
		.toInt()
		.isInt({ min: 1900, max: 2100 })
		.withMessage('Year must be between 1900 and 2100.'),

	body('inv_price')
		.exists({ checkFalsy: true })
		.withMessage('Price is required.')
		.bail()
		.toFloat()
		.isFloat({ min: 0 })
		.withMessage('Price must be a number greater than or equal to 0.'),

	body('inv_miles')
		.exists({ checkFalsy: true })
		.withMessage('Miles is required.')
		.bail()
		.toInt()
		.isInt({ min: 0 })
		.withMessage('Miles must be an integer greater than or equal to 0.'),

	body('inv_color')
		.exists({ checkFalsy: true })
		.withMessage('Color is required.')
		.bail()
		.trim()
		.escape(),

	// Allow simple path-like inputs. Adjust if you later store full URLs.
	body('inv_image')
		.optional({ checkFalsy: true })
		.trim()
		.matches(/^[A-Za-z0-9_\/.\-]+$/)
		.withMessage('Invalid image path.'),

	body('inv_thumbnail')
		.optional({ checkFalsy: true })
		.trim()
		.matches(/^[A-Za-z0-9_\/.\-]+$/)
		.withMessage('Invalid thumbnail path.'),
]

module.exports = {
	validateClassification,
	validateInventory,
}