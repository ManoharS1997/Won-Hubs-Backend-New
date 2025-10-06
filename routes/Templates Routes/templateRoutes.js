const express = require("express");
const router = express.Router();

const {
  createTemplate,
  updateTemplate,
  getTemplateById,
  deleteTemplate,
} = require("../../controllers/TemplateControllers/templateControllers");

// ✅ Create Template
router.post("/newTemplate", createTemplate);

// ✅ Update Template
router.put("/update/:templateId", updateTemplate);

// ✅ Get Template by ID
router.get("/:templateId", getTemplateById);

// ✅ Delete Template
router.delete("/delete/:templateId", deleteTemplate);

module.exports = router;
