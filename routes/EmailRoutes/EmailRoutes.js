const express = require("express");
const router = express.Router();
// const {sendExportEmail} = require("../../contr
// ollers/EmailControllers/EmailController");
const { sendExportEmail } = require("../../controllers/EmailControllers/EmailController");

// Base path: /email
console.log("Triggering in email Routes")
router.post("/export", sendExportEmail);

module.exports = router;