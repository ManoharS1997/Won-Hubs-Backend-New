const express = require("express");
const router = express.Router();
const { AddAlert, UpdateAlert, GetAlertById, DeleteAlert } = require("../../controllers/alertControllers/alertcontrollers");

// Add new alert
router.post("/newAlert", AddAlert);

// Update alert
router.put("/update/:alertId", UpdateAlert);

// Get alert by ID
router.get("/:alertId", GetAlertById);

// Delete alert
router.delete("/delete/:alertId", DeleteAlert);

module.exports = router;
