const express = require("express");
const router = express.Router();
const connectionsController = require("../../controllers/connectionsControllers/connectionControllers");

// Create new connection
router.post("/connections/newConnection", connectionsController.createConnection);

// Update connection by ID
router.put("/connections/update/:connectionId", connectionsController.updateConnection);

// Get connection by ID
router.get("/connections/:connectionId", connectionsController.getConnectionById);

// Delete connection by ID
router.delete("/connections/delete/:connectionId", connectionsController.deleteConnection);

module.exports = router;
