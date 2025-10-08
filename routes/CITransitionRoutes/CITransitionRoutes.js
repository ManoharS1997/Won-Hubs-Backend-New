const express = require("express");
const router = express.Router();

const {
  createTransition,
  updateTransition,
  getTransitionById,
  deleteTransition,
} = require("../../controllers/CiTransitionsControllers/CiTransitionsControllers");

// ✅ Create
router.post("/newTransition", createTransition);

// ✅ Update
router.put("/update/:transitionId", updateTransition);

// ✅ Get by ID
router.get("/:transitionId", getTransitionById);

// ✅ Delete
router.delete("/delete/:transitionId", deleteTransition);

module.exports = router;
