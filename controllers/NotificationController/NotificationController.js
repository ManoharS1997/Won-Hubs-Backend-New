const db = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
// const { getOrganizationIdWithUserId } = require("../utils/helperFunctions");

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
        console.error("❌ Error inserting notification record:", error);
        return res.status(500).json({ error: "Notifications Internal Server Error" });
      }

      res.json({ success: true, recordId: results.insertId });
    });

  } catch (err) {
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

// ✅ Get Notification by ID
const getNotificationById = (req, res) => {
  const recordId = req.params.notificationId;

  const query = `SELECT * FROM notifications WHERE id = ?`;

  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching notification record:", error);
      return res.status(500).json({ error: "Notifications Internal server error" });
    }

    if (!results.length) return res.status(404).json({ error: "Notification not found" });

    res.json({ record: results[0] });
  });
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
