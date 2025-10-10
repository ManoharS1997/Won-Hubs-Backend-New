const express = require("express");
const router = express.Router();
const {
  createModule,
  getModuleByName,
} = require("../../controllers/formDesigner/apiListController");

router.post("/api/list", createModule);
router.get("/api/list/:moduleName", getModuleByName);

module.exports = router;
