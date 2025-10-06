const db = require("../../config/DB-connection");

// ✅ Create a new Service Mapping
const createServiceMapping = (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO service_mapping (
      department, category, sub_category, service, manager,
      created_by, last_modified, status, short_description, active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.department || null,
    recordData.category || null,
    recordData.sub_category || null,
    recordData.service || null,
    recordData.manager || null,
    recordData.created_by || null,
    recordData.last_modified || null,
    recordData.status || null,
    recordData.short_description || null,
    recordData.active ?? true,
  ];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error inserting service mapping record:", error);
      return res.status(500).json({ error: "Service Mapping Internal Server Error" });
    }

    res.json({ success: true, recordId: results.insertId });
  });
};

// ✅ Update Service Mapping
const updateServiceMapping = (req, res) => {
  const recordData = req.body;
  const recordId = req.params.serviceId;

  const updateQuery = `
    UPDATE service_mapping
    SET
      department = ?,
      category = ?,
      sub_category = ?,
      service = ?,
      manager = ?,
      created_by = ?,
      last_modified = ?,
      status = ?,
      short_description = ?,
      active = ?
    WHERE id = ?
  `;

  const values = [
    recordData.department || null,
    recordData.category || null,
    recordData.sub_category || null,
    recordData.service || null,
    recordData.manager || null,
    recordData.created_by || null,
    recordData.last_modified || null,
    recordData.status || null,
    recordData.short_description || null,
    recordData.active ?? true,
    recordId,
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error updating service mapping record:", error);
      return res.status(500).json({ error: "Service Mapping Internal Server Error" });
    }

    res.json({ success: true, recordId });
  });
};

// ✅ Get Service Mapping by ID
const getServiceMappingById = (req, res) => {
  const recordId = req.params.serviceId;

  const query = `SELECT * FROM service_mapping WHERE id = ?`;

  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching service mapping record:", error);
      return res.status(500).json({ error: "Service Mapping Internal Server Error" });
    }

    if (!results.length) return res.status(404).json({ error: "Record not found" });

    res.json({ record: results[0] });
  });
};

// ✅ Delete Service Mapping
const deleteServiceMapping = (req, res) => {
  const recordId = req.params.serviceId;

  const deleteQuery = `DELETE FROM service_mapping WHERE id = ?`;

  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting service mapping record:", error);
      return res.status(500).json({ error: "Service Mapping Internal Server Error" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  });
};

module.exports = {
  createServiceMapping,
  updateServiceMapping,
  getServiceMappingById,
  deleteServiceMapping,
};
