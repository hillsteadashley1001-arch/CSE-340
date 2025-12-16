const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  })

<<<<<<< Updated upstream
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
=======
  // Added for troubleshooting queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
    pool
  }
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  module.exports = pool
>>>>>>> Stashed changes
}
