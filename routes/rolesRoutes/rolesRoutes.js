const express = require("express");
const router = express.Router();

const {
  AddRole,
  updateRole,
  getRoleById,
  deleteRole
} = require("../../controllers/rolesControllers/rolesControllers");

// Routes
router.post("/newRole", AddRole);
router.put("/update/:roleId", updateRole);
router.get("/:roleId", getRoleById);
router.delete("/delete/:roleId", deleteRole);

module.exports = router;
