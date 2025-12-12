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
}
