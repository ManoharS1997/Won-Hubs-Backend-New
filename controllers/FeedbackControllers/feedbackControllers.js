const jwt = require("jsonwebtoken");
const { db } = require("../../config/DB-connection");
// const { getOrganizationIdWithUserId } = require("../utils/authUtils"); // adjust path if needed
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");


// 🔹 Helper to remove HTML tags
const stripHtml = (str) => {
  if (!str) return null;
  return str.replace(/<[^>]*>/g, "").trim();
};

// 🔹 Helper to get current MySQL datetime
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

// ✅ Create new feedback
const createFeedback = async (req, res) => {
  try {
    const recordData = req.body;
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized: No access token provided" });
    }

    // Verify token
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
      INSERT INTO feedback (
        title, short_description, date_of_submission,
        template_image_name, template_image, sections,
        active, responses, created, updated,
        created_by, updated_by, org_id, type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.title?.value || null,
      stripHtml(recordData.description?.value) ||
        stripHtml(recordData.shortDescription) ||
        stripHtml(recordData.sections?.[0]?.sectionDescription) ||
        null,
      nowMySQL,
      recordData.title?.value || null,
      recordData.image || null,
      JSON.stringify(recordData.sections || []),
      recordData.active ?? true,
      JSON.stringify(recordData.responses || []),
      nowMySQL,
      nowMySQL,
      userId,
      userId,
      recordData.orgId || orgId || "001",
      recordData.type?.value || recordData.type || "Desktop",
    ];

    const [results] = await db.query(insertQuery, values);
    console.log("✅ Feedback record inserted successfully");
    res.status(201).json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.error("Error handling /feedback/newFeedback:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Update feedback record
const updateFeedback = async (req, res) => {
  const recordData = req.body;
  const { feedbackId } = req.params;

  try {
    const updateQuery = `
      UPDATE feedback SET
        title = ?, short_description = ?, date_of_submission = ?, 
        feedback_on = ?, active = ?, preview = ?, created = ?, 
        updated = ?, created_by = ?, updated_by = ?
      WHERE id = ?
    `;

    const values = [
      recordData.title || null,
      recordData.shortDescription || null,
      recordData.dateOfSubmission || null,
      recordData.feedbackOn || null,
      recordData.active ?? true,
      recordData.preview || null,
      recordData.created || null,
      recordData.updated || getCurrentMySQLDate(),
      recordData.createdBy || null,
      recordData.updatedBy || null,
      feedbackId,
    ];

    await db.query(updateQuery, values);
    console.log("Feedback updated successfully");
    res.json({ success: true, feedbackId });
  } catch (error) {
    console.error("Error while updating the feedback record:", error);
    res.status(500).json({ error: "Feedback internal server error" });
  }
};

// ✅ Get feedback by ID
const getFeedbackById = async (req, res) => {
  const { feedbackId } = req.params;
  try {
    const [results] = await db.query(`SELECT * FROM feedback WHERE id = ?`, [feedbackId]);

    if (!results.length) {
      return res.status(404).json({ error: "Feedback record not found" });
    }

    res.json({ record: results[0] });
  } catch (error) {
    console.error("Error fetching feedback record:", error);
    res.status(500).json({ error: "Feedback internal server error" });
  }
};

// ✅ Delete feedback record
const deleteFeedback = async (req, res) => {
  const { feedbackId } = req.params;

  try {
    const [results] = await db.query(`DELETE FROM feedback WHERE id = ?`, [feedbackId]);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Feedback record deleted successfully" });
    } else {
      res.status(404).json({ error: "Feedback record not found" });
    }
  } catch (error) {
    console.error("Error deleting feedback record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createFeedback,
  updateFeedback,
  getFeedbackById,
  deleteFeedback,
};
