const db = require("../../config/DB-connection");

// Create a new core transaction
const createTransaction = async (req, res) => {
  try {
    const recordData = req.body;

    const insertQuery = `
      INSERT INTO core_transactions (
        user_id, first_name, last_name, title, department, email, phone_number,
        group_id, group_name, group_email, parent_group, group_type, region,
        company_id, company_name, role_id, role_name, role_type,
        location_id, location_name, postal_code, department_id, manager,
        connection_id, connection_name, user, created_by, created_date,
        source_name, target_name, contact_person
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.userId || null,
      recordData.firstName || null,
      recordData.lastName || null,
      recordData.title || null,
      recordData.department || null,
      recordData.email || null,
      recordData.phoneNumber || null,
      recordData.groupId || null,
      recordData.groupName || null,
      recordData.groupEmail || null,
      recordData.parentGroup || null,
      recordData.groupType || null,
      recordData.region || null,
      recordData.companyId || null,
      recordData.companyName || null,
      recordData.roleId || null,
      recordData.roleName || null,
      recordData.roleType || null,
      recordData.locationId || null,
      recordData.locationName || null,
      recordData.postalCode || null,
      recordData.departmentId || null,
      recordData.manager || null,
      recordData.connectionId || null,
      recordData.connectionName || null,
      recordData.user || null,
      recordData.createdBy || null,
      recordData.createdDate || new Date(),
      recordData.sourceName || null,
      recordData.targetName || null,
      recordData.contactPerson || null
    ];

    const [results] = await db.query(insertQuery, values);
    res.json({ success: true, recordId: results.insertId });
  } catch (err) {
    console.error("Error creating core transaction:", err);
    res.status(500).json({ error: "Core Transactions Internal Server Error" });
  }
};

// Update transaction by ID
const updateTransaction = async (req, res) => {
  try {
    const recordId = req.params.transactionId;
    const recordData = req.body;

    const updateQuery = `
      UPDATE core_transactions SET
        user_id = ?, first_name = ?, last_name = ?, title = ?, department = ?, email = ?, phone_number = ?,
        group_id = ?, group_name = ?, group_email = ?, parent_group = ?, group_type = ?, region = ?,
        company_id = ?, company_name = ?, role_id = ?, role_name = ?, role_type = ?,
        location_id = ?, location_name = ?, postal_code = ?, department_id = ?, manager = ?,
        connection_id = ?, connection_name = ?, user = ?, created_by = ?, created_date = ?,
        source_name = ?, target_name = ?, contact_person = ?
      WHERE transaction_id = ?
    `;

    const values = [
      recordData.userId || null,
      recordData.firstName || null,
      recordData.lastName || null,
      recordData.title || null,
      recordData.department || null,
      recordData.email || null,
      recordData.phoneNumber || null,
      recordData.groupId || null,
      recordData.groupName || null,
      recordData.groupEmail || null,
      recordData.parentGroup || null,
      recordData.groupType || null,
      recordData.region || null,
      recordData.companyId || null,
      recordData.companyName || null,
      recordData.roleId || null,
      recordData.roleName || null,
      recordData.roleType || null,
      recordData.locationId || null,
      recordData.locationName || null,
      recordData.postalCode || null,
      recordData.departmentId || null,
      recordData.manager || null,
      recordData.connectionId || null,
      recordData.connectionName || null,
      recordData.user || null,
      recordData.createdBy || null,
      recordData.createdDate || new Date(),
      recordData.sourceName || null,
      recordData.targetName || null,
      recordData.contactPerson || null,
      recordId
    ];

    const [results] = await db.query(updateQuery, values);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error("Error updating core transaction:", err);
    res.status(500).json({ error: "Core Transactions Internal Server Error" });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const recordId = req.params.transactionId;
    const query = `SELECT * FROM core_transactions WHERE transaction_id = ?`;
    const [results] = await db.query(query, [recordId]);

    if (!results.length) return res.status(404).json({ error: "Transaction not found" });

    res.json({ record: results[0] });
  } catch (err) {
    console.error("Error fetching transaction:", err);
    res.status(500).json({ error: "Core Transactions Internal Server Error" });
  }
};

// Delete transaction by ID
const deleteTransaction = async (req, res) => {
  try {
    const recordId = req.params.transactionId;
    const deleteQuery = `DELETE FROM core_transactions WHERE transaction_id = ?`;
    const [results] = await db.query(deleteQuery, [recordId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Transaction deleted successfully" });
    } else {
      return res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Core Transactions Internal Server Error" });
  }
};

module.exports = {
  createTransaction,
  updateTransaction,
  getTransactionById,
  deleteTransaction
};
