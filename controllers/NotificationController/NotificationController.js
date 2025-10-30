const { db } = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");

// ✅ Create Notification
const createNotification = async (req, res) => {
  console.log("Triggering here");
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

    const [results] = await db.query(insertQuery, values);
    console.log("✅ Notification created with ID:", results.insertId);
    return res.json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.log(err,"Error here")
    console.error("❌ Unexpected error:", err);
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
      userId,
      recordData.whoWillRecieve || null,
      recordData.bulkNotification || null,
      recordData.smsAlert || null,
      recordData.preview || null,
      userId,
      orgId || null,
      recordId,
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Notification not found" });
    console.log("✅ Notification updated with ID:", recordId);
    return res.json({ success: true, recordId });
  } catch (err) {
    console.log(err,"Error here")
    console.error("❌ Error processing update request:", err);
    return res.status(500).json({ error: "Unexpected Server Error" });
  }
};

// ✅ Get Notification by ID
const getNotificationById = async (req, res) => {
  try {
    console.log(req.params,"params Hereee")
    const recordId = req.params.notificationId;
    const query = `SELECT * FROM notifications WHERE id = ?`;

    const [results] = await db.query(query, [recordId]);
    // console.log("✅ Fetched notification record:", results);

    if (!results.length)
      return res.status(404).json({ error: "Notification not found" });

    return res.json({ record: results[0] });
  } catch (error) {
    console.error("❌ Error fetching notification record:", error);
    return res.status(500).json({ error: "Notifications Internal Server Error" });
  }
};

// ✅ Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const recordId = req.params.notificationId;
    const deleteQuery = `DELETE FROM notifications WHERE id = ?`;

    const [results] = await db.query(deleteQuery, [recordId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Record deleted successfully" });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  } catch (error) {
    console.error("❌ Error deleting notification record:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createNotification,
  updateNotification,
  getNotificationById,
  deleteNotification,
};
