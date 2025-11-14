const { db } = require("../../config/DB-connection");
const jwt = require("jsonwebtoken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");

// ✅ Create Notification
const createNotification = async (req, res) => {
  // console.log("Triggering here");
  try {
    const recordData = req.body;
    // console.log(recordData, "recordData here");
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    // console.log("Organization ID:", orgId);
    const insertQuery = `
      INSERT INTO notifications (
        name, active, to_address, cc, type, description, subject,
        email_body, created_by, who_will_receive, bulk_notification, sms_alert,
        preview, created, updated, updated_by, org_id, from_address
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?) 
    `;

    // ✅ Extract .value safely
    const extract = (field) => (field && typeof field === "object" ? field.value : field);

    const values = [
      extract(recordData.name),
      extract(recordData.active) ?? true,
      extract(recordData.to),
      extract(recordData.cc),
      extract(recordData.type) || "desktop",
      extract(recordData.description),
      extract(recordData.subject),
      recordData.content || null,
      userId,
      extract(recordData.whoWillRecieve),
      extract(recordData.bulkNotification),
      extract(recordData.smsAlert),
      extract(recordData.preview),
      userId,
      orgId || null,
      extract(recordData.from) || null,
    ];

    const [results] = await db.query(insertQuery, values);
    console.log("✅ Notification created with ID:", results.insertId);
    return res.json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected Server Error" });
  }
};


// ✅ Update Notification
const updateNotification = async (req, res) => {
  try {
    const recordData = req.body;
    const recordId = req.params.notificationId;

    console.log(recordData, "recordData here");

    // ---- Token ----
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    // Helper to extract .value
    const extract = (field) =>
      field && typeof field === "object" ? field.value : field;

    // ---- SQL Query (Corrected) ----
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

    // ---- Values (Correct order) ----
    const values = [
      extract(recordData.name),                        // name
      extract(recordData.active) ?? true,              // active
      extract(recordData.to),                          // to_address
      extract(recordData.cc),                          // cc
      extract(recordData.type) || "desktop",           // type
      extract(recordData.description),                 // description
      extract(recordData.subject),                     // subject
      recordData.content || null,                      // email_body
      userId,                                          // created_by
      extract(recordData.whoWillRecieve),              // who_will_receive
      extract(recordData.bulkNotification),            // bulk_notification
      extract(recordData.smsAlert),                    // sms_alert
      extract(recordData.preview),                     // preview
      userId,                                          // updated_by
      orgId || null,                                   // org_id
      recordId                                         // WHERE id = ?
    ];

    // ---- Execute Query ----
    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    console.log("✅ Notification updated with ID:", recordId);

    return res.json({ success: true, recordId });

  } catch (err) {
    console.error("❌ Error updating notification:", err);
    return res.status(500).json({ error: "Unexpected Server Error" });
  }
};

// ✅ Get Notification by ID
const getNotificationById = async (req, res) => {
  try {
    console.log(req.params, "params Hereee")
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
