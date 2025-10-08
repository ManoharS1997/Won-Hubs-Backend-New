const { db } = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
// const { getOrganizationIdWithUserId } = require("../utils/helperFunctions");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId")

// ✅ Create Notification
const createNotification = async (req, res) => {
  try {
    const recordData = req.body;

    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const insertQuery = `
      INSERT INTO notifications (
        name, active, to_address, cc, type, description, subject,
        email_body, created_by, who_will_receive, bulk_notification, sms_alert,
        preview, created, updated, updated_by, org_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
    `;

    const values = [
      recordData.name || null,
      recordData.active ?? true,
      recordData.toAddress || null,
      recordData.cc || null,
      recordData.type || "desktop",
      recordData.description || null,
      recordData.subject || null,
      JSON.stringify(recordData.emailBody) || null,
      userId,
      recordData.whoWillRecieve || null,
      recordData.bulkNotification || null,
      recordData.smsAlert || null,
      recordData.preview || null,
      userId,
      orgId || null,
    ];

    db.query(insertQuery, values, (error, results) => {
      if (error) {
        console.log(error, "error here")

        console.error("❌ Error inserting notification record:", error);
        return res.status(500).json({ error: "Notifications Internal Server Error" });
      }
      console.log("✅ Notification record created with ID:", results.insertId);

      res.json({ success: true, recordId: results.insertId });
    });

  } catch (err) {
    console.log(err, "error here")
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected Server Error" });
  }
};

// ✅ Update Notification
const updateNotification = async (req, res) => {
  try {
    const recordData = req.body;
    const recordId = req.params.notificationId;

    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const updateQuery = `
      UPDATE notifications 
      SET 
        name = ?,
        active = ?,
        to_address = ?,
        cc = ?,
        type = ?,
        description = ?,
        subject = ?,
        email_body = ?,
        created_by = ?,
        who_will_receive = ?,
        bulk_notification = ?,
        sms_alert = ?,
        preview = ?,
        updated = NOW(),
        updated_by = ?,
        org_id = ?
      WHERE id = ?
    `;

    const values = [
      recordData.name || null,
      recordData.active ?? true,
      recordData.toAddress || null,
      recordData.cc || null,
      recordData.type || "desktop",
      recordData.description || null,
      recordData.subject || null,
      JSON.stringify(recordData.emailBody) || null,
      recordData.createdBy || null,
      recordData.whoWillRecieve || null,
      recordData.bulkNotification || null,
      recordData.smsAlert || null,
      recordData.preview || null,
      recordData.updatedBy || null,
      orgId || null,
      recordId,
    ];

    db.query(updateQuery, values, (error, results) => {
      if (error) {
        console.error("❌ Error updating notification record:", error);
        return res.status(500).json({ error: "Notifications internal server error" });
      }

      res.json({ success: true, recordId });
    });

  } catch (err) {
    console.error("❌ Error processing update request:", err);
    return res.status(401).json({ error: "Unauthorized or invalid request" });
  }
};

const getNotificationById = async (req, res) => {
 

  const recordId = req.params.recordId;

  if (!recordId) {
    // console.error("⚠️ No recordId found in req.params");
    return res.status(400).json({ success: false, error: "Missing recordId parameter" });
  }
  const query = `SELECT * FROM notifications WHERE id = ?`;
  try {
    const [results] = await db.query(query, [recordId]);
    if (!results || results.length === 0) {
      // console.warn("⚠️ No notification found for ID:", recordId);
      return res.status(404).json({ success: false, error: "Notification not found" });
    }
    return res.status(200).json({
      success: true,
      record: results[0],
    });

  } catch (error) {
    console.log("❌ Error while fetching notification record:", error);
    return res.status(500).json({
      success: false,
      error: "Notifications Internal server error",
    });
  }
};



// ✅ Delete Notification
const deleteNotification = (req, res) => {
  const recordId = req.params.notificationId;

  const deleteQuery = `DELETE FROM notifications WHERE id = ?`;

  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting notification record:", error);
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
  createNotification,
  updateNotification,
  getNotificationById,
  deleteNotification,
};
