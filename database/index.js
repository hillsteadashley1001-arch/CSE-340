/*************************************************************
 * database/index.js
 * Database connection pool
 *************************************************************/

const { Pool } = require("pg")
require("dotenv").config()

/* =======================
 * Pool Configuration
 * ======================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "development"
      ? false
      : { rejectUnauthorized: false },
})

/* =======================
 * Connection Test
 * ======================= */
pool.on("connect", () => {
  console.log("✅ Database connected")
})

pool.on("error", (err) => {
  console.error("❌ Unexpected DB error", err)
  process.exit(1)
})

/* =======================
 * Export Pool
 * ======================= */
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
}
