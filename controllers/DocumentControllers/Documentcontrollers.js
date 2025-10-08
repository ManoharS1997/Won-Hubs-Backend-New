const db = require("../../config/DB-connection");

// ✅ CREATE Document
const createDocument = (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO document_manager (
      document_type, 
      document_size, 
      document_name,
      who_can_access, 
      created_by, 
      last_modified, 
      created_date, 
      description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.documentType || null,
    recordData.documentSize || null,
    recordData.documentName || null,
    recordData.whoCanAccess || null,
    recordData.createdBy || null,
    recordData.lastModified || null,
    recordData.createdDate || null,
    recordData.description || null,
  ];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error inserting document record:", error);
      return res.status(500).json({ error: "Document manager internal server error" });
    }

    console.log("✅ Document record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
};

// ✅ UPDATE Document
const updateDocument = (req, res) => {
  const recordData = req.body;
  const recordId = req.params.documentId;

  const updateQuery = `
    UPDATE document_manager SET 
      document_type = ?, 
      document_size = ?, 
      document_name = ?, 
      who_can_access = ?, 
      created_by = ?, 
      last_modified = ?, 
      created_date = ?, 
      description = ?
    WHERE document_id = ?
  `;

  const values = [
    recordData.documentType || null,
    recordData.documentSize || null,
    recordData.documentName || null,
    recordData.whoCanAccess || null,
    recordData.createdBy || null,
    recordData.lastModified || null,
    recordData.createdDate || null,
    recordData.description || null,
    recordId
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error updating document record:", error);
      return res.status(500).json({ error: "Document manager internal server error" });
    }

    if (results.affectedRows > 0) {
      console.log("✅ Document updated successfully");
      res.json({ success: true, recordId });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });
};

// ✅ GET Document by ID
const getDocumentById = (req, res) => {
  const recordId = req.params.documentId;
  const query = `SELECT * FROM document_manager WHERE document_id = ?`;

  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching document record:", error);
      return res.status(500).json({ error: "Document manager internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ record: results[0] });
  });
};

// ✅ DELETE Document
const deleteDocument = (req, res) => {
  const recordId = req.params.documentId;
  const deleteQuery = `DELETE FROM document_manager WHERE document_id = ?`;

  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting document record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });
};

module.exports = {
  createDocument,
  updateDocument,
  getDocumentById,
  deleteDocument,
};
