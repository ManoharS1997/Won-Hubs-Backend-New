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
    console.log("Received feedback data:", recordData);
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

    const { content } = recordData;
    const { questions, imageFile } = content || {};

    const insertQuery = `
      INSERT INTO feedback (
        name, description, date_of_submission,
        template_image_name, template_image,
        active, created, updated,
        created_by, updated_by, org_id,
        type, from_address, to_address, cc, subject, questions, image_file
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.name?.value || null,
      stripHtml(recordData.description?.value) || null,
      nowMySQL, // ✅ Correct date of submission
      recordData.imageName || null, // ✅ template_image_name
      recordData.image || null,
      recordData.active ?? true,
      nowMySQL, // created
      nowMySQL, // updated
      userId, // created_by
      userId, // updated_by
      recordData.orgId || orgId || "001",
      recordData.type?.value || recordData.type || "Desktop",
      recordData.from?.value || recordData.from || null,
      recordData.to?.value || recordData.to || null,
      recordData.cc?.value || recordData.cc || null,
      recordData.subject?.value || recordData.subject || null,
      questions ? JSON.stringify(questions) : null,
      imageFile || null,
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
  console.log("Triggering Heree");
  try {
    const recordData = req.body;
    const { feedbackId } = req.params;
    // console.log("Received update data:", recordData);

    if (!feedbackId) {
      return res.status(400).json({ error: "Missing feedbackId in params" });
    }

    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized: No access token provided" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    const nowMySQL = getCurrentMySQLDate();

    // Extract feedback content safely
    const { content } = recordData || {};
    const { questions, imageFile } = content || {};

    // Ensure optional fields are safely defaulted
    const imageName = recordData?.imageName || null;
    const imageData = recordData?.image || null;

    const updateQuery = `
      UPDATE feedback SET
        name = ?, 
        description = ?, 
        date_of_submission = ?,
        template_image_name = ?, 
        template_image = ?,
        active = ?, 
        updated = ?, 
        updated_by = ?, 
        org_id = ?,
        type = ?, 
        from_address = ?, 
        to_address = ?, 
        cc = ?, 
        subject = ?, 
        questions = ?, 
        image_file = ?
      WHERE id = ?
    `;

    const values = [
      recordData?.name?.value || null,
      stripHtml(recordData?.description?.value) || null,
      nowMySQL, // date_of_submission
      imageName,
      imageData,
      recordData?.active ?? true,
      nowMySQL, // updated timestamp
      userId,
      recordData?.orgId || orgId || "001",
      recordData?.type?.value || recordData?.type || "Desktop",
      recordData?.from?.value || recordData?.from || null,
      recordData?.to?.value || recordData?.to || null,
      recordData?.cc?.value || recordData?.cc || null,
      recordData?.subject?.value || recordData?.subject || null,
      questions ? JSON.stringify(questions) : null,
      imageFile || null,
      feedbackId,
    ];

    await db.query(updateQuery, values);

    console.log("✅ Feedback updated successfully");
    return res.json({ success: true, feedbackId });
  } catch (err) {
    console.error("❌ Error updating feedback:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
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
