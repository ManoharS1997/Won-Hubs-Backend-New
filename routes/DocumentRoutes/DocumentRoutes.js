const express = require("express");
const router = express.Router();

const {
  createDocument,
  updateDocument,
  getDocumentById,
  deleteDocument,
} = require("../../controllers/DocumentControllers/Documentcontrollers");

// ✅ Create Document
router.post("/newDocument", createDocument);

// ✅ Update Document
router.put("/update/:documentId", updateDocument);

// ✅ Get Document by ID
router.get("/:documentId", getDocumentById);

// ✅ Delete Document
router.delete("/delete/:documentId", deleteDocument);

module.exports = router;
