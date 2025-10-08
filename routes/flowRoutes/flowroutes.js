const express = require("express");
const router = express.Router();
const {
  AddFlow,
  updateFlow,
  getFlowById,
  deleteFlow
} = require("../../controllers/flowControllers/flowcontrollers");

// CRUD routes
router.post("/newFlow", AddFlow);
router.put("/update/:flowId", updateFlow);
router.get("/:flowId", getFlowById);
router.delete("/delete/:flowId", deleteFlow);

module.exports = router;
