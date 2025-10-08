const { db, pool, connection } = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const stripHtml = (str) => {
  if (!str) return null;
  return str.replace(/<[^>]*>/g, '').trim();
};
// make sure to install this if used

// Helper function to get MySQL formatted date
const getCurrentMySQLDate = () => {
  const d = new Date();
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

// ✅ Add new alert
const AddAlert = async (req, res) => {
  const recordData = req.body;

  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const nowMySQL = getCurrentMySQLDate();

    const insertQuery = `
      INSERT INTO alerts (title, type, short_description, active, created_by, created, org_id, formTitle)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.title?.value || null,
      recordData.type?.value || "desktop",
      stripHtml(recordData.short_description) || null,
      recordData.active ?? true,
      userId,
      nowMySQL,
      orgId,
      recordData?.formTitle?.value || null,
    ];

    connection.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error("Error inserting alert record: ", error);
        return res.status(500).json({ error: "Alerts Internal Server Error", details: error.sqlMessage });
      }
      res.json({ success: true, recordId: results.insertId });
    });
  } catch (err) {
    console.error("Error in AddAlert:", err);
    res.status(401).json({ error: "Unauthorized or invalid token" });
  }
};

// ✅ Update alert
const UpdateAlert = async (req, res) => {
  const recordId = req.params.alertId;
  const updateData = req.body;

  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const updateQuery = `
      UPDATE alerts SET
        title = ?,
        type = ?,
        short_description = ?,
        active = ?,
        created_by = ?,
        created = ?,
        org_id = ?
      WHERE id = ?
    `;

    const values = [
      updateData.title || null,
      updateData.type || "desktop",
      stripHtml(updateData.short_description) || null,
      updateData.active ?? true,
      updateData.createdBy || userId,
      updateData.created || new Date(),
      orgId,
      recordId,
    ];

    connection.query(updateQuery, values, (error) => {
      if (error) {
        console.error("Error updating alert record:", error);
        return res.status(500).json({ error: "Alerts Internal Server Error", details: error.sqlMessage });
      }
      res.json({ success: true, recordId });
    });
  } catch (err) {
    console.error("Error in UpdateAlert:", err);
    res.status(401).json({ error: "Unauthorized or invalid token" });
  }
};

// ✅ Get alert by ID
const GetAlertById = (req, res) => {
  const recordId = req.params.alertId;

  const query = `SELECT * FROM alerts WHERE id = ?`;
  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error fetching alert record:", error);
      return res.status(500).json({ error: "Alerts Internal Server Error" });
    }
    if (results.length === 0) return res.status(404).json({ error: "Alert not found" });

    res.json({ record: results[0] });
  });
};

// ✅ Delete alert
const DeleteAlert = (req, res) => {
  const recordId = req.params.alertId;

  const deleteQuery = `DELETE FROM alerts WHERE id = ?`;
  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting alert record:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.affectedRows === 0) return res.status(404).json({ error: "Alert not found" });

    res.json({ success: true, message: "Record deleted successfully" });
  });
};

module.exports = {
  AddAlert,
  UpdateAlert,
  GetAlertById,
  DeleteAlert,
};
