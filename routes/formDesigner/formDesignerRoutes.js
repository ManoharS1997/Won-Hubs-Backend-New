const express = require("express");
const router = express.Router();

const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} = require("../../controllers/formDesigner/formDesignerController");

router.post("/", createModule);
router.get("/", getModules);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

module.exports = router;