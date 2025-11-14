const express = require("express");
const router = express.Router();

const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleByFields,
  saveFormData,
  assignApi,
  alterModule,
} = require("../../controllers/formDesigner/formDesignerController");

router.post("/", createModule);
router.get("/", getModules);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);
router.post("/getModuleByFields", getModuleByFields);
router.post("/tab/assign-api", assignApi);
router.post("/:module/create", alterModule);
module.exports = router;
