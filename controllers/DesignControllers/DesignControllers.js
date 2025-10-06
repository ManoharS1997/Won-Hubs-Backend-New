const { db } = require('../../config/DB-connection');
const { decodeAccessToken } = require('../../utils/auth/DecodeAccessToken');
// const {getOrganizationIdWithUserId} =require('../../utils/auth/') // adjust path if different

// ✅ Add a new design
const createDesign = async (req, res) => {
  const recordData = req.body;

  try {
    const { id } = decodeAccessToken(req.headers['authorization']);
    const orgId = await getOrganizationIdWithUserId(id);

    const insertQuery = `
      INSERT INTO designs (
        title, description, department, category, sub_category, product,
        fields, tabs, buttons, created_by, updated_by, no_of_fields,
        created, updated, org_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.title || 'Untitled',
      recordData.description || null,
      recordData.department || null,
      recordData.category || null,
      recordData.sub_category || null,
      recordData.product || null,
      JSON.stringify(recordData.fields) || null,
      JSON.stringify(recordData.tabs) || null,
      JSON.stringify(recordData.buttons) || null,
      recordData.created_by || null,
      recordData.updated_by || null,
      recordData.no_of_fields || null,
      recordData.created || null,
      recordData.updated || null,
      orgId || null,
    ];

    const [results] = await db.query(insertQuery, values);
    console.log('Design record inserted successfully');
    res.json({ success: true, recordId: results.insertId });

  } catch (error) {
    console.error('Error inserting design record:', error);
    res.status(500).json({ error: 'Designs internal server error' });
  }
};

// ✅ Update design by ID
const updateDesign = async (req, res) => {
  const recordData = req.body;
  const { designId } = req.params;

  try {
    const updateQuery = `
      UPDATE designs SET
        title = ?, description = ?, department = ?, category = ?,
        sub_category = ?, product = ?, fields = ?, tabs = ?, buttons = ?,
        created_by = ?, updated_by = ?, no_of_fields = ?, created = ?, updated = ?
      WHERE id = ?
    `;

    const values = [
      recordData.title || null,
      recordData.description || null,
      recordData.department || null,
      recordData.category || null,
      recordData.sub_category || null,
      recordData.product || null,
      JSON.stringify(recordData.fields) || null,
      JSON.stringify(recordData.tabs) || null,
      JSON.stringify(recordData.buttons) || null,
      recordData.created_by || null,
      recordData.updated_by || null,
      recordData.no_of_fields || null,
      recordData.created || null,
      recordData.updated || null,
      designId
    ];

    await db.query(updateQuery, values);
    console.log('Design updated successfully');
    res.json({ success: true, designId });

  } catch (error) {
    console.error('Error while updating the design record:', error);
    res.status(500).json({ error: 'Designs internal server error' });
  }
};

// ✅ Get design by ID
const getDesignById = async (req, res) => {
  const { designId } = req.params;

  try {
    const [results] = await db.query(`SELECT * FROM designs WHERE id = ?`, [designId]);

    if (!results.length) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record: results[0] });
  } catch (error) {
    console.error('Error fetching record details:', error);
    res.status(500).json({ error: 'Designs internal server error' });
  }
};

// ✅ Delete design by ID
const deleteDesign = async (req, res) => {
  const { designId } = req.params;

  try {
    const [results] = await db.query(`DELETE FROM designs WHERE id = ?`, [designId]);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  } catch (error) {
    console.error('Error deleting design record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createDesign,
  updateDesign,
  getDesignById,
  deleteDesign
};
