const db = require("../../config/DB-connection");

// ✅ Create a new approval
const createApproval = (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO approvals (
      state, approved_by, requested_by, approved_date, created_date,
      approved_notes, short_description, description, active, name,
      approval_group, location, due_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.state || null,
    recordData.approvedBy || null,
    recordData.requestedBy || null,
    recordData.approvedDate || null,
    recordData.createdDate || null,
    recordData.approvedNotes || null,
    recordData.shortDescription || null,
    recordData.description || null,
    recordData.active || null,
    recordData.name || null,
    recordData.approvalGroup || null,
    recordData.location || null,
    recordData.dueDate || null,
  ];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error inserting approval:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, recordId: results.insertId });
  });
};

// ✅ Update approval by ID
const updateApproval = (req, res) => {
  const recordData = req.body;
  const recordId = req.params.approvalId;

  const updateQuery = `
    UPDATE approvals SET
      state = ?, 
      approved_by = ?, 
      requested_by = ?, 
      approved_date = ?, 
      created_date = ?, 
      approved_notes = ?, 
      short_description = ?, 
      description = ?, 
      active = ?, 
      name = ?, 
      approval_group = ?, 
      location = ?, 
      due_date = ?
    WHERE id = ?
  `;

  const values = [
    recordData.state || null,
    recordData.approvedBy || null,
    recordData.requestedBy || null,
    recordData.approvedDate || null,
    recordData.createdDate || null,
    recordData.approvedNotes || null,
    recordData.shortDescription || null,
    recordData.description || null,
    recordData.active || null,
    recordData.name || null,
    recordData.approvalGroup || null,
    recordData.location || null,
    recordData.dueDate || null,
    recordId,
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error updating approval:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, recordId });
  });
};

// ✅ Get approval by ID
const getApprovalById = (req, res) => {
  const recordId = req.params.approvalId;

  const query = "SELECT * FROM approvals WHERE id = ?";
  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching approval:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!results.length) return res.status(404).json({ error: "Approval not found" });

    res.json({ record: results[0] });
  });
};

// ✅ Delete approval by ID
const deleteApproval = (req, res) => {
  const recordId = req.params.approvalId;

  const deleteQuery = "DELETE FROM approvals WHERE id = ?";
  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting approval:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Approval deleted successfully" });
    } else {
      res.status(404).json({ error: "Approval not found" });
    }
  });
};

module.exports = {
  createApproval,
  updateApproval,
  getApprovalById,
  deleteApproval,
};
