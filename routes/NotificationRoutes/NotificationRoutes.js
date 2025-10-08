const express = require("express");
const router = express.Router();

const {
  createNotification,
  updateNotification,
  getNotificationById,
  deleteNotification,
} = require("../../controllers/NotificationController/NotificationController");

// ✅ Create notification
router.post("/newNotifications", createNotification);

// ✅ Update notification
router.put("/update/:notificationId", updateNotification);

// ✅ Get notification by ID
router.get("/:recordId", getNotificationById);

// ✅ Delete notification
router.delete("/delete/:notificationId", deleteNotification);

module.exports = router;
