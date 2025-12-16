// models/review-model.js
const pool = require("../database/")

/* ***************************
 * Add a new review
 *************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO public.review
        (review_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING
        review_id,
        review_text,
        review_date,
        inv_id,
        account_id
    `
    const data = await pool.query(sql, [review_text, inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error:", error)
    return null
  }
}

/* ***************************
 * Get reviews for an inventory item (newest first)
 *************************** */
async function getReviewByInvId(inv_id) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.review_text,
        r.review_date,
        r.inv_id,
        r.account_id,
        a.account_firstname,
        a.account_lastname
      FROM public.review r
      JOIN public.account a
        ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewByInvId error:", error)
    return []
  }
}

/* ***************************
 * Get reviews by account id
 *************************** */
async function getReviewByAccountId(account_id) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.review_text,
        r.review_date,
        r.inv_id,
        i.inv_make,
        i.inv_model
      FROM public.review r
      JOIN public.inventory i
        ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getReviewByAccountId error:", error)
    return []
  }
}

/* ***************************
 * Get single review by id
 *************************** */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT
        review_id,
        review_text,
        review_date,
        inv_id,
        account_id
      FROM public.review
      WHERE review_id = $1
    `
    const data = await pool.query(sql, [review_id])
    return data.rows[0] || null
  } catch (error) {
    console.error("getReviewById error:", error)
    return null
  }
}

/* ***************************
 * Update review text
 *************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE public.review
      SET review_text = $1
      WHERE review_id = $2
      RETURNING review_id
    `
    const data = await pool.query(sql, [review_text, review_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("updateReview error:", error)
    return false
  }
}

/* ***************************
 * Delete review
 *************************** */
async function deleteReview(review_id) {
  try {
    const sql = `
      DELETE FROM public.review
      WHERE review_id = $1
    `
    const data = await pool.query(sql, [review_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteReview error:", error)
    return false
  }
}

module.exports = {
  addReview,
  getReviewByInvId,
  getReviewByAccountId,
  getReviewById,
  updateReview,
  deleteReview,
}
