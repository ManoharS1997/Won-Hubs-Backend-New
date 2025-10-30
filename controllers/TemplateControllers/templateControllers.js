const { db } = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");

// Helper: Strip HTML
const stripHtml = (str) => {
  if (!str) return null;
  return str.replace(/<[^>]*>/g, "").trim();
};

// Helper: Get current date in MySQL format
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


const createTemplate = async (req, res) => {
  try {
    const recordData = req.body;
    console.log(req.body,"req.body Heree")
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
    to_address,
    created_by,
    sms_alert,
    preview,
    created,
    updated,
    content,
    org_id,
    subject,
    cc,
    from_address
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;


    const values = [
      recordData.name?.value || null,
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
      recordData.subject?.value || null,
      recordData.cc?.value || null,
      recordData.from?.value || null,
    ];

    const [results] = await db.query(insertQuery, values);
    console.log("✅ Template inserted successfully:", results);

    res.status(201).json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.error("❌ Error in createTemplate:", err);
    res.status(500).json({ error: "Template Internal Server Error", details: err.message });
  }
};

//
// ✅ UPDATE Template
//
const updateTemplate = async (req, res) => {
  try {
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

    const [results] = await db.query(updateQuery, values);
    console.log("🟡 Update results:", results);

    if (results.affectedRows > 0) {
      console.log("✅ Template updated successfully");
      res.json({ success: true, recordId });
    } else {
      res.status(404).json({ error: "Template not found" });
    }
  } catch (err) {
    console.error("❌ Error updating template:", err);
    res.status(500).json({ error: "Template Internal Server Error", details: err.message });
  }
};

//
// ✅ GET Template by ID
//
const getTemplateById = async (req, res) => {
  try {
    const recordId = req.params.templateId;
    const query = `SELECT * FROM templates WHERE id = ?`;

    const [results] = await db.query(query, [recordId]);
    console.log("📄 Query results:", results);

    if (!results.length) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ success: true, record: results[0] });
  } catch (err) {
    console.error("❌ Error fetching template:", err);
    res.status(500).json({ error: "Template Internal Server Error", details: err.message });
  }
};

//
// ✅ DELETE Template
//
const deleteTemplate = async (req, res) => {
  try {
    const recordId = req.params.templateId;
    const deleteQuery = `DELETE FROM templates WHERE id = ?`;

    const [results] = await db.query(deleteQuery, [recordId]);
    console.log("🗑️ Delete results:", results);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting template:", err);
    res.status(500).json({ error: "Template Internal Server Error", details: err.message });
  }
};

module.exports = {
  createTemplate,
  updateTemplate,
  getTemplateById,
  deleteTemplate,
};
