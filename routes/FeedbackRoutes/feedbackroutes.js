const express = require("express");
const router = express.Router();
const {
  createFeedback,
  updateFeedback,
  getFeedbackById,
  deleteFeedback,
} = require("../../controllers/FeedbackControllers/feedbackControllers");

// Base path: /feedback
router.post("/newFeedback", createFeedback);
router.put("/update/:feedbackId", updateFeedback);
router.get("/:feedbackId", getFeedbackById);
router.delete("/delete/:feedbackId", deleteFeedback);

module.exports = router;
