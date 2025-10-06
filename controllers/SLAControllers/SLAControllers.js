const db = require("../../config/DB-connection");

// ✅ Create new SLA record
const createSLA = (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO sla (
      sla_name, start_date, target_date, end_date,
      duration, remaining_duration, created_by, last_modified,
      sla_description, time_format
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.slaName || null,
    recordData.startDate || null,
    recordData.targetDate || null,
    recordData.endDate || null,
    recordData.duration || null,
    recordData.remainingDuration || null,
    recordData.createdBy || null,
    recordData.lastModified || null,
    recordData.slaDescription || null,
    recordData.timeFormat || null,
  ];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error inserting SLA record:", error);
      return res.status(500).json({ error: "SLA Internal Server Error" });
    }

    res.json({ success: true, recordId: results.insertId });
  });
};

// ✅ Update SLA record
const updateSLA = (req, res) => {
  const recordData = req.body;
  const recordId = req.params.slaId;

  const updateQuery = `
    UPDATE sla
    SET
      sla_name = ?,
      start_date = ?,
      target_date = ?,
      end_date = ?,
      duration = ?,
      remaining_duration = ?,
      created_by = ?,
      last_modified = ?,
      sla_description = ?,
      time_format = ?
    WHERE id = ?
  `;

  const values = [
    recordData.slaName || null,
    recordData.startDate || null,
    recordData.targetDate || null,
    recordData.endDate || null,
    recordData.duration || null,
    recordData.remainingDuration || null,
    recordData.createdBy || null,
    recordData.lastModified || null,
    recordData.slaDescription || null,
    recordData.timeFormat || null,
    recordId,
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error updating SLA record:", error);
      return res.status(500).json({ error: "SLA Internal Server Error" });
    }

    res.json({ success: true, recordId });
  });
};

// ✅ Get SLA by ID
const getSLAById = (req, res) => {
  const recordId = req.params.slaId;

  const query = `SELECT * FROM sla WHERE id = ?`;

  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching SLA record:", error);
      return res.status(500).json({ error: "SLA Internal Server Error" });
    }

    if (!results.length) return res.status(404).json({ error: "Record not found" });

    res.json({ record: results[0] });
  });
};

// ✅ Delete SLA by ID
const deleteSLA = (req, res) => {
  const recordId = req.params.slaId;

  const deleteQuery = `DELETE FROM sla WHERE id = ?`;

  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting SLA record:", error);
      return res.status(500).json({ error: "SLA Internal Server Error" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  });
};

module.exports = {
  createSLA,
  updateSLA,
  getSLAById,
  deleteSLA,
};
