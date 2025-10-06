const express = require("express");
const router = express.Router();
const {
  createApproval,
  updateApproval,
  getApprovalById,
  deleteApproval,
} = require("../../controllers/ApprovalController/ApprovalController");

// ✅ Create a new approval
router.post("/newRecord", createApproval);

// ✅ Update approval by ID
router.put("/update/:approvalId", updateApproval);

// ✅ Get approval by ID
router.get("/:approvalId", getApprovalById);

// ✅ Delete approval by ID
router.delete("/delete/:approvalId", deleteApproval);

module.exports = router;
