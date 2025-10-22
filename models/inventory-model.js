// models/inventory-model.js
const pool = require("../database"); // adjust if your Pool export lives elsewhere

async function getVehicleById(invId) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
           inv_color, inv_description, inv_image, inv_thumbnail,
           classification_id
    FROM inventory
    WHERE inv_id = $1
    LIMIT 1;
  `;
  const result = await pool.query(sql, [invId]);
  return result.rows[0] || null;
}

module.exports = { getVehicleById };