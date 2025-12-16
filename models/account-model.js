const pool = require("../database/")

/* ****************************************
 * Get account by ID
 **************************************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id,
             account_firstname,
             account_lastname,
             account_email,
             account_type
      FROM account
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("getAccountById error:", error)
    throw error
  }
}

/* ****************************************
 * Get account by Email (for login)
 **************************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT *
      FROM account
      WHERE account_email = $1
    `
    const result = await pool.query(sql, [account_email])
    return result.rows[0] || null
  } catch (error) {
    console.error("getAccountByEmail error:", error)
    throw error
  }
}

/* ****************************************
 * Register new account
 **************************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  hashedPassword
) {
  try {
    const sql = `
      INSERT INTO account
        (account_firstname, account_lastname, account_email, account_password)
      VALUES ($1, $2, $3, $4)
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ])
    return result.rows[0]
  } catch (error) {
    console.error("registerAccount error:", error)
    throw error
  }
}

/* ****************************************
 * Update account information
 **************************************** */
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname  = $2,
          account_email     = $3
      WHERE account_id = $4
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ])
    return result.rows[0] || null
  } catch (error) {
    console.error("updateAccount error:", error)
    throw error
  }
}

/* ****************************************
 * Update account password
 **************************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING account_id
    `
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rowCount === 1
  } catch (error) {
    console.error("updatePassword error:", error)
    throw error
  }
}

module.exports = {
  getAccountById,
  getAccountByEmail,
  registerAccount,
  updateAccount,
  updatePassword,
}
