const express = require("express");
const router = express.Router();
const {
  createTask,
  updateTask,
  getTaskById,
  deleteTask,
} = require("../../controllers/TaskController/TaskController");

// ✅ Create a new task
router.post("/newTask", createTask);

// ✅ Update task by ID
router.put("/update/:taskId", updateTask);

// ✅ Get task by ID
router.get("/:taskId", getTaskById);

// ✅ Delete task by ID
router.delete("/delete/:taskId", deleteTask);

module.exports = router;
