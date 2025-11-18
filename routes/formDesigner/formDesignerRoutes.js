const express = require("express");
const router = express.Router();
console.log("Triggering in Routes")

const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleByFields
} = require("../../controllers/formDesigner/formDesignerController");

router.post("/", createModule);
router.get("/", getModules);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);
router.post("/getModuleByFields", getModuleByFields);
module.exports = router;