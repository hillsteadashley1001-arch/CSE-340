// models/inventory-model.js
const pool = require("../database/")

/* ***************************
 * Get all classifications
 *************************** */
async function getClassifications() {
  try {
    const sql = `
      SELECT classification_id, classification_name
      FROM classification
      ORDER BY classification_name
    `
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getClassifications error:", error)
    return []
  }
}

/* ***************************
 * Add classification
 *************************** */
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id
  `
  return pool.query(sql, [classification_name]) // ✅ RETURN FULL RESULT
}

/* ***************************
 * Add inventory item
 *************************** */
async function addInventory(
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
) {
  try {
    const sql = `
      INSERT INTO public.inventory
        (classification_id, inv_make, inv_model, inv_year,
         inv_description, inv_image, inv_thumbnail,
         inv_price, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING inv_id
    `
    const result = await pool.query(sql, [
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
    ])
    return result.rows[0]
  } catch (error) {
    console.error("addInventory error:", error)
    throw error
  }
}

/* ***************************
 * Update inventory item
 *************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        inv_make = $2,
        inv_model = $3,
        inv_year = $4,
        inv_description = $5,
        inv_image = $6,
        inv_thumbnail = $7,
        inv_price = $8,
        inv_miles = $9,
        inv_color = $10,
        classification_id = $11
      WHERE inv_id = $1
      RETURNING inv_id
    `

    const data = await pool.query(sql, [
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
      classification_id,
    ])

    return data.rowCount === 1
  } catch (error) {
    console.error("updateInventory error:", error)
    return false
  }
}

/* ***************************
 * Delete inventory item
 *************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = `
      DELETE FROM public.inventory
      WHERE inv_id = $1
    `
    const data = await pool.query(sql, [inv_id])
    return data.rowCount === 1
  } catch (error) {
    console.error("deleteInventoryItem error:", error)
    return false
  }
}

/* ***************************
 * Get inventory by classification ID
 *************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = `
      SELECT
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_description,
        i.inv_image,
        i.inv_thumbnail,
        i.inv_price,
        i.inv_miles,
        i.inv_color,
        c.classification_name
      FROM public.inventory i
      JOIN public.classification c
        ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
      ORDER BY i.inv_make, i.inv_model
    `
    const data = await pool.query(sql, [classification_id])
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    return []
  }
}

/* ***************************
 * Get inventory item by ID
 *************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = `
      SELECT *
      FROM public.inventory
      WHERE inv_id = $1
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows[0] || null
  } catch (error) {
    console.error("getInventoryById error:", error)
    return null
  }
}

/* ***************************
 * Get all inventory
 *************************** */
async function getAllInventory() {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory i
      JOIN public.classification c
        ON i.classification_id = c.classification_id
      ORDER BY i.inv_make
    `
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getAllInventory error:", error)
    return []
  }
}

module.exports = {
  getClassifications,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventoryItem,
  getInventoryByClassificationId,
  getInventoryById,
  getAllInventory,
}
