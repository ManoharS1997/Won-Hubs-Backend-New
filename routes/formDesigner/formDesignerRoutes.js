const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleByFields,
  assignApi,
  alterModule,
  getDynamicModuleData,
} = require("../../controllers/formDesigner/formDesignerController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

router.post("/", createModule);
router.get("/", getModules);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);
router.post("/getModuleByFields", getModuleByFields);
router.post("/tab/assign-api", assignApi);
router.post("/dynamic/save", upload.any(), alterModule);
router.get("/dynamic/get", getDynamicModuleData);

module.exports = router;
