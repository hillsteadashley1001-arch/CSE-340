// routes/static.js
const path = require('path');
const express = require('express');

const router = express.Router();

// Absolute path to the public directory
const publicDir = path.join(__dirname, '..', 'public');

// Optional: set a sensible cache policy for static assets
const oneWeek = 7 * 24 * 60 * 60 * 1000;
const staticOpts = {
	// Strong caching for hashed assets; adjust as needed
	maxAge: oneWeek,
	// Don’t serve dotfiles by accident
	dotfiles: 'ignore',
	// Set immutable if you fingerprint filenames
	immutable: true,
};

// Serve entire public folder at the web root
router.use(express.static(publicDir, staticOpts));

// Explicit mounts for clarity (not strictly required once the line above exists,
// but kept to match your original intention and allow future per-path options)
router.use('/css', express.static(path.join(publicDir, 'css'), staticOpts));
router.use('/js', express.static(path.join(publicDir, 'js'), staticOpts));
router.use('/images', express.static(path.join(publicDir, 'images'), staticOpts));

module.exports = router;

