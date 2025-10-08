const db = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
// const { getOrganizationIdWithUserId } = require("../utils/helpers");

// Helper to strip HTML
const stripHtml = (str) => {
  if (!str) return null;
  return str.replace(/<[^>]*>/g, "").trim();
};

// Helper: get current date in MySQL format
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

// ✅ CREATE Template
const createTemplate = async (req, res) => {
  try {
    const recordData = req.body;
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized: No access token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    const nowMySQL = getCurrentMySQLDate();

    const insertQuery = `
      INSERT INTO templates (
        name, 
        active, 
        type,
        style, 
        short_description, 
        who_will_receive, 
        created_by, 
        sms_alert, 
        preview, 
        created,
        updated,
        content,
        org_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.title?.value || null,
      recordData.active ?? true,
      recordData.type?.value || recordData.type || null,
      recordData.style || null,
      stripHtml(recordData.description?.value) || null,
      recordData.to?.value || null,
      userId,
      recordData.smsAlerts ?? null,
      recordData.preview || null,
      nowMySQL,
      nowMySQL,
      JSON.stringify(recordData.content || []),
      recordData.orgId || orgId || "001",
    ];

    db.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error("Error inserting template:", error);
        return res.status(500).json({ error: "Template Internal Server Error" });
      }
      console.log("✅ Template inserted successfully");
      res.status(201).json({ success: true, recordId: results.insertId });
    });
  } catch (err) {
    console.error("Error in createTemplate:", err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
};

// ✅ UPDATE Template
const updateTemplate = (req, res) => {
  const recordData = req.body;
  const recordId = req.params.templateId;

  const nowMySQL = getCurrentMySQLDate();
  const updateQuery = `
    UPDATE templates SET 
      name = ?, 
      active = ?, 
      type = ?, 
      style = ?, 
      short_description = ?, 
      who_will_receive = ?, 
      created_by = ?, 
      sms_alert = ?, 
      preview = ?, 
      updated = ?
    WHERE id = ?
  `;

  const values = [
    recordData.name || null,
    recordData.active ?? true,
    recordData.type || null,
    recordData.style || null,
    recordData.shortDescription || null,
    recordData.whoWillReceive || null,
    recordData.createdBy || null,
    recordData.smsAlert || null,
    recordData.preview || null,
    nowMySQL,
    recordId,
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("Error updating template record:", error);
      return res.status(500).json({ error: "Template internal server error" });
    }

    if (results.affectedRows > 0) {
      console.log("✅ Template updated successfully");
      res.json({ success: true, recordId });
    } else {
      res.status(404).json({ error: "Template not found" });
    }
  });
};

// ✅ GET Template by ID
const getTemplateById = (req, res) => {
  const recordId = req.params.templateId;
  const query = `SELECT * FROM templates WHERE id = ?`;

  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error fetching template details:", error);
      return res.status(500).json({ error: "Template internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ record: results[0] });
  });
};

// ✅ DELETE Template
const deleteTemplate = (req, res) => {
  const recordId = req.params.templateId;
  const deleteQuery = `DELETE FROM templates WHERE id = ?`;

  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting template:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  });
};

module.exports = {
  createTemplate,
  updateTemplate,
  getTemplateById,
  deleteTemplate,
};
