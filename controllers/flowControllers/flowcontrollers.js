const { db } = require("../../config/DB-connection");

// 🟢 Add new flow
const AddFlow = async (req, res) => {
  try {
    const recordData = req.body;

    const insertQuery = `
      INSERT INTO flows 
      (flow_name, description, active, department, category, sub_category, service, 
       created_by, trigger_name, created, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.flowName || null,
      recordData.description || null,
      recordData.active || null,
      recordData.department || null,
      recordData.category || null,
      recordData.subCategory || null,
      recordData.service || null,
      recordData.createdBy || null,
      recordData.triggerName || null,
      recordData.created || null,
      recordData.data || null
    ];

    const [results] = await db.query(insertQuery, values);

    res.json({ success: true, recordId: results.insertId });
  } catch (error) {
    console.error("Error inserting flow record:", error);
    res.status(500).json({ error: "Flow Internal Server Error" });
  }
};

// 🟡 Update flow
const updateFlow = async (req, res) => {
  try {
    const flowId = req.params.flowId;
    const updatedData = req.body;

    const updateQuery = `
      UPDATE flows SET 
        flow_name = ?, 
        description = ?, 
        active = ?, 
        department = ?, 
        category = ?, 
        sub_category = ?, 
        service = ?, 
        created_by = ?, 
        trigger_name = ?, 
        created = ?, 
        data = ?
      WHERE id = ?
    `;

    const values = [
      updatedData.flowName || null,
      updatedData.description || null,
      updatedData.active || null,
      updatedData.department || null,
      updatedData.category || null,
      updatedData.subCategory || null,
      updatedData.service || null,
      updatedData.createdBy || null,
      updatedData.triggerName || null,
      updatedData.created || null,
      updatedData.data || null,
      flowId
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Flow record not found" });
    }

    res.json({ success: true, message: "Flow record updated successfully" });
  } catch (error) {
    console.error("Error updating flow record:", error);
    res.status(500).json({ error: "Flow Internal Server Error" });
  }
};

// 🟢 Get flow by ID
const getFlowById = async (req, res) => {
  try {
    const flowId = req.params.flowId;
    const [results] = await db.query("SELECT * FROM flows WHERE id = ?", [flowId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Flow record not found" });
    }

    res.json({ record: results[0] });
  } catch (error) {
    console.error("Error fetching flow record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔴 Delete flow
const deleteFlow = async (req, res) => {
  try {
    const flowId = req.params.flowId;
    const [results] = await db.query("DELETE FROM flows WHERE id = ?", [flowId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Flow record deleted successfully" });
    } else {
      return res.status(404).json({ error: "Flow record not found" });
    }
  } catch (error) {
    console.error("Error deleting flow record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  AddFlow,
  updateFlow,
  getFlowById,
  deleteFlow
};
