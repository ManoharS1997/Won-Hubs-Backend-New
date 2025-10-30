const { db } = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");

// ✅ Helper: remove HTML tags
const stripHtml = (input) => {
  if (!input) return null;

  // Handle case where input might be an object like { value: "..." }
  const str = typeof input === "object" && input.value ? input.value : input;

  // Ensure we only call replace on actual strings
  return typeof str === "string"
    ? str.replace(/<[^>]*>/g, "").trim()
    : null;
};


// ✅ Helper: get MySQL-formatted current date
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
  try {
    const recordData = req.body;
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
      recordData.short_description || null,
      recordData.active ?? true,
      userId,
      nowMySQL,
      orgId,
      recordData?.formTitle?.value || null,
    ];

    const [results] = await db.query(insertQuery, values);

    res.json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.error("❌ Error in AddAlert:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// ✅ Update alert
const UpdateAlert = async (req, res) => {
  try {
    const recordId = req.params.alertId;
    const updateData = req.body;

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
      getCurrentMySQLDate(),
      orgId,
      recordId,
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Alert not found" });

    res.json({ success: true, recordId });
  } catch (err) {
    console.error("❌ Error in UpdateAlert:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// ✅ Get alert by ID
const GetAlertById = async (req, res) => {
  try {
    const recordId = req.params.alertId;

    const [results] = await db.query(`SELECT * FROM alerts WHERE id = ?`, [recordId]);

    if (results.length === 0)
      return res.status(404).json({ error: "Alert not found" });

    res.json({ record: results[0] });
  } catch (err) {
    console.error("❌ Error in GetAlertById:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// ✅ Delete alert
const DeleteAlert = async (req, res) => {
  try {
    const recordId = req.params.alertId;

    const [results] = await db.query(`DELETE FROM alerts WHERE id = ?`, [recordId]);

    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Alert not found" });

    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    console.error("❌ Error in DeleteAlert:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

module.exports = {
  AddAlert,
  UpdateAlert,
  GetAlertById,
  DeleteAlert,
};
