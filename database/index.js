<<<<<<< HEAD
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("DATABASE_URL:", process.env.DATABASE_URL)

const { Pool } = require("pg")
require("dotenv").config()

let pool

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  })
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // required by most cloud hosts
  })
}

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text, error })
      throw error
    }
  },
=======
// database/index.js
const { Pool } = require('pg')
require('dotenv').config()

/*
 * Connection Pool
 * - In development: no SSL, log queries for troubleshooting.
 * - In production: enable SSL (common for Render/Heroku), no query logging.
 */

const isDev = process.env.NODE_ENV === 'development'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: isDev ? false : { rejectUnauthorized: false },
})

module.exports = {
	// Unified export shape across environments
	async query(text, params) {
		try {
			if (isDev) console.log('executed query', { text })
			const res = await pool.query(text, params)
			return res
		} catch (error) {
			console.error('error in query', { text, error })
			throw error
		}
	},
	// Expose the raw pool if you ever need transactions or client pooling
	pool,
>>>>>>> b3b369d7dbc405228009bcb94f127bd9a00b1120
}
