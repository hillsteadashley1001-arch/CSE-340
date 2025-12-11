// models/inventory-model.js
const db = require('../database/') // { query, pool }

/*****************************************
 * Get all classification data
 *****************************************/
async function getClassifications() {
  return db.query(
    'SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name'
  )
}

/*****************************************
 * Get inventory by classification_id
 *****************************************/
async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
  `
  const result = await db.query(sql, [classification_id])
  return result.rows
}

/*****************************************
 * Get a single inventory item by inv_id
 *****************************************/
async function getInvById(inv_id) {
  const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`
  const result = await db.query(sql, [inv_id])
  return result.rows[0]
}

/*****************************************
 * Insert new classification
 *****************************************/
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id, classification_name
  `
  const result = await db.query(sql, [classification_name])
  return result.rows[0] // or null if not inserted
}

/*****************************************
 * Insert new inventory item
 *****************************************/
async function addInventory(v) {
  const sql = `
    INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_description,
       inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id
  `
  const params = [
    v.classification_id, v.inv_make, v.inv_model, v.inv_year, v.inv_description,
    v.inv_image, v.inv_thumbnail, v.inv_price, v.inv_miles, v.inv_color
  ]
  const result = await db.query(sql, params)
  return result.rows[0] // { inv_id }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInvById,
  addClassification,
  addInventory,
}