const {db} = require("../../config/DB-connection");

// Create a new connection
const createConnection = async (req, res) => {
  try {
    const recordData = req.body;

    const insertQuery = `
      INSERT INTO connections (
        name, type, description, end_point, authentication_type, enabled, created_at,
        user, status, notes, integration_type, frequency, connection_parameter,
        who_can_access, timeout, cost, version, source, created_by, expiration_policy,
        connection_secrete, user_name, password, attachment, source_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.name,
      recordData.type,
      recordData.description,
      recordData.endPoint,
      recordData.authenticationType,
      recordData.enabled,
      recordData.createdAt,
      recordData.user,
      recordData.status,
      recordData.notes,
      recordData.integrationType,
      recordData.frequency,
      recordData.connectionParameter,
      recordData.whoCanAccess,
      recordData.timeout,
      recordData.cost,
      recordData.version,
      recordData.source,
      recordData.createdBy,
      recordData.expirationPolicy,
      recordData.connectionSecrete,
      recordData.userName,
      recordData.password,
      recordData.attachment,
      recordData.sourcePath
    ];

    const [results] = await db.query(insertQuery, values);
    res.json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.error("Error inserting connection record:", err);
    res.status(500).json({ error: "Connections Internal Server Error" });
  }
};

// Update connection by ID
const updateConnection = async (req, res) => {
  try {
    const recordData = req.body;
    const recordId = req.params.connectionId;

    const updateQuery = `
      UPDATE connections SET
        name = ?, type = ?, description = ?, end_point = ?, authentication_type = ?, enabled = ?,
        created_at = ?, user = ?, status = ?, notes = ?, integration_type = ?, frequency = ?,
        connection_parameter = ?, who_can_access = ?, timeout = ?, cost = ?, version = ?, source = ?,
        created_by = ?, expiration_policy = ?, connection_secrete = ?, user_name = ?, password = ?,
        attachment = ?, source_path = ?
      WHERE id = ?
    `;

    const values = [
      recordData.name || null,
      recordData.type || null,
      recordData.description || null,
      recordData.endPoint || null,
      recordData.authenticationType || null,
      recordData.enabled || null,
      recordData.createdAt || null,
      recordData.user || null,
      recordData.status || null,
      recordData.notes || null,
      recordData.integrationType || null,
      recordData.frequency || null,
      recordData.connectionParameter || null,
      recordData.whoCanAccess || null,
      recordData.timeout || null,
      recordData.cost || null,
      recordData.version || null,
      recordData.source || null,
      recordData.createdBy || null,
      recordData.expirationPolicy || null,
      recordData.connectionSecrete || null,
      recordData.userName || null,
      recordData.password || null,
      recordData.attachment || null,
      recordData.sourcePath || null,
      recordId
    ];

    const [results] = await db.query(updateQuery, values);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error("Error updating connection record:", err);
    res.status(500).json({ error: "Connections Internal Server Error" });
  }
};

// Get connection by ID
const getConnectionById = async (req, res) => {
  try {
    const recordId = req.params.connectionId;
    const query = `SELECT * FROM connections WHERE id = ?`;
    const [results] = await db.query(query, [recordId]);

    if (!results.length) return res.status(404).json({ error: "Record not found" });

    res.json({ record: results[0] });
  } catch (err) {
    console.error("Error fetching connection record:", err);
    res.status(500).json({ error: "Connections Internal Server Error" });
  }
};

// Delete connection by ID
const deleteConnection = async (req, res) => {
  try {
    const recordId = req.params.connectionId;
    const deleteQuery = `DELETE FROM connections WHERE id = ?`;
    const [results] = await db.query(deleteQuery, [recordId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Record deleted successfully" });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  } catch (err) {
    console.error("Error deleting connection record:", err);
    res.status(500).json({ error: "Connections Internal Server Error" });
  }
};

module.exports = {
  createConnection,
  updateConnection,
  getConnectionById,
  deleteConnection
};
