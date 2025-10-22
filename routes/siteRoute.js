// routes/siteRoute.js
const express = require("express");
const router = express.Router();

const siteController = require("../controllers/siteController");

// Home
router.get("/", siteController.buildHome);

// Intentional 500 error (Task 3)
router.get("/cause-error", siteController.triggerServerError);

module.exports = router;