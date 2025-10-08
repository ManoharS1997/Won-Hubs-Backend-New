const express = require("express");
const router = express.Router();

const apiKeysController = require("../../controllers/apiKeysControllers/apiKeysController");

router.get("/list", apiKeysController.getApiKeys);
router.get("/list/active", apiKeysController.getActiveApiKeys);
router.post("/create", apiKeysController.createApiKey);
router.delete("/delete/:id", apiKeysController.deleteApiKey);

module.exports = router;