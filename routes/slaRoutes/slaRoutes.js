const express = require("express");
const router = express.Router();
const {
  createSLA,
  updateSLA,
  getSLAById,
  deleteSLA,
} = require("../../controllers/SLAControllers/SLAControllers");

// ✅ Create new SLA
router.post("/newRecord", createSLA);

// ✅ Update SLA
router.put("/update/:slaId", updateSLA);

// ✅ Get SLA by ID
router.get("/:slaId", getSLAById);

// ✅ Delete SLA by ID
router.delete("/delete/:slaId", deleteSLA);

module.exports = router;
