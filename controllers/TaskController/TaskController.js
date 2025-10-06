const db = require("../../config/DB-connection");

// ✅ Create new task
const createTask = (req, res) => {
  const taskData = req.body;

  const insertQuery = `
    INSERT INTO tasks (
      name, on_behalf_of, status, approval_state, short_description, description,
      private_comments, public_comments, active, history, priority, requested_email,
      department, state, assigned_member, approved_by, requested_by, task_type,
      attachments, price_per_unit, quantity
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    taskData.name || null,
    taskData.on_behalf_of || null,
    taskData.status || null,
    taskData.approval_state || null,
    taskData.short_description || null,
    taskData.description || null,
    taskData.private_comments || null,
    taskData.public_comments || null,
    taskData.active || null,
    taskData.history || null,
    taskData.priority || null,
    taskData.requested_email || null,
    taskData.department || null,
    taskData.state || null,
    taskData.assigned_member || null,
    taskData.approved_by || null,
    taskData.requested_by || null,
    taskData.task_type || null,
    taskData.attachments || null,
    taskData.price_per_unit || null,
    taskData.quantity || null,
  ];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error inserting task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, taskId: results.insertId });
  });
};

// ✅ Update task by ID
const updateTask = (req, res) => {
  const updatedTaskData = req.body;
  const taskId = req.params.taskId;

  const updateQuery = `
    UPDATE tasks SET 
      service = ?,
      status = ?,
      approval_state = ?,
      short_description = ?,
      description = ?,
      private_comments = ?,
      public_comments = ?,
      active = ?,
      history = ?
    WHERE id = ?
  `;

  const values = [
    updatedTaskData.service || null,
    updatedTaskData.status || null,
    updatedTaskData.approval_state || null,
    updatedTaskData.short_description || null,
    updatedTaskData.description || null,
    updatedTaskData.private_comments || null,
    updatedTaskData.public_comments || null,
    updatedTaskData.active || null,
    updatedTaskData.history || null,
    taskId,
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error updating task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, taskId });
  });
};

// ✅ Get task by ID
const getTaskById = (req, res) => {
  const taskId = req.params.taskId;

  const query = "SELECT * FROM tasks WHERE id = ?";
  db.query(query, [taskId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!results.length) return res.status(404).json({ error: "Task not found" });

    res.json({ task: results[0] });
  });
};

// ✅ Delete task by ID
const deleteTask = (req, res) => {
  const taskId = req.params.taskId;

  const deleteQuery = "DELETE FROM tasks WHERE id = ?";
  db.query(deleteQuery, [taskId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Task deleted successfully" });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });
};

module.exports = {
  createTask,
  updateTask,
  getTaskById,
  deleteTask,
};
