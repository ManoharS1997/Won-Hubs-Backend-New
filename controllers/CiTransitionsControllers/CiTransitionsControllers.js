const db = require("../../config/DB-connection");

// ✅ CREATE Transition
const createTransition = (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO ci_transitions (
      item_name, 
      item_tag, 
      item_description,
      company, 
      serial_number, 
      model_number, 
      version, 
      storage, 
      operating_system, 
      os_domain,
      service_pack,
      manufacturer,
      relationship_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.itemName || null,
    recordData.itemTag || null,
    recordData.itemDescription || null,
    recordData.company || null,
    recordData.serialNumber || null,
    recordData.modelNumber || null,
    recordData.version || null,
    recordData.storage || null,
    recordData.operatingSystem || null,
    recordData.osDomain || null,
    recordData.servicePack || null,
    recordData.manufacturer || null,
    recordData.relationshipId || null,
  ];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error inserting transition record:", error);
      return res.status(500).json({ error: "Transition internal server error" });
    }

    console.log("✅ Transition record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
};

// ✅ UPDATE Transition
const updateTransition = (req, res) => {
  const recordData = req.body;
  const recordId = req.params.transitionId;

  const updateQuery = `
    UPDATE ci_transitions SET  
      item_name = ?, 
      item_tag = ?, 
      item_description = ?, 
      company = ?, 
      serial_number = ?, 
      model_number = ?, 
      version = ?, 
      storage = ?, 
      operating_system = ?, 
      os_domain = ?, 
      service_pack = ?, 
      manufacturer = ?, 
      relationship_id = ?
    WHERE id = ?
  `;

  const values = [
    recordData.itemName || null,
    recordData.itemTag || null,
    recordData.itemDescription || null,
    recordData.company || null,
    recordData.serialNumber || null,
    recordData.modelNumber || null,
    recordData.version || null,
    recordData.storage || null,
    recordData.operatingSystem || null,
    recordData.osDomain || null,
    recordData.servicePack || null,
    recordData.manufacturer || null,
    recordData.relationshipId || null,
    recordId,
  ];

  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("❌ Error updating transition record:", error);
      return res.status(500).json({ error: "Transition internal server error" });
    }

    if (results.affectedRows > 0) {
      console.log("✅ Transition updated successfully");
      res.json({ success: true, recordId });
    } else {
      res.status(404).json({ error: "Transition not found" });
    }
  });
};

// ✅ GET Transition by ID
const getTransitionById = (req, res) => {
  const recordId = req.params.transitionId;
  const query = `SELECT * FROM ci_transitions WHERE id = ?`;

  db.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error fetching transition record:", error);
      return res.status(500).json({ error: "Transition internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Transition not found" });
    }

    res.json({ record: results[0] });
  });
};

// ✅ DELETE Transition
const deleteTransition = (req, res) => {
  const recordId = req.params.transitionId;
  const deleteQuery = `DELETE FROM ci_transitions WHERE id = ?`;

  db.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("❌ Error deleting transition record:", error);
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
  createTransition,
  updateTransition,
  getTransitionById,
  deleteTransition,
};
