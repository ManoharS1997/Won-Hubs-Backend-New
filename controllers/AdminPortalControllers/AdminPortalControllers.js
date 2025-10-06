const { db } = require('../../config/DB-connection');

// Get all unique departments
const getDepartments = async (req, res) => {
  try {
    const [results] = await db.query(`SELECT DISTINCT department FROM admin_portal_forms`);
    const departments = results.map(row => row.department);
    res.json({ departments });
  } catch (error) {
    console.error('Error fetching unique departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unique categories for a department
const getCategories = async (req, res) => {
  const { department } = req.params;
  try {
    const [results] = await db.query(
      `SELECT DISTINCT category FROM admin_portal_forms WHERE department = ?`,
      [department]
    );
    const categories = results.map(row => row.category);
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unique subcategories for department + category
const getSubCategories = async (req, res) => {
  const { category, department } = req.params;
  try {
    const [results] = await db.query(
      `SELECT DISTINCT sub_category FROM admin_portal_forms WHERE department = ? AND category = ?`,
      [department, category]
    );
    const subCategories = results.map(row => row.sub_category);
    res.json({ subCategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get admin portal forms data for specific department, category, and subcategory
const getAdminPortalForms = async (req, res) => {
  const { subCategory, category, department } = req.params;
  const Standard = 'true';

  try {
    const [results] = await db.query(
      `SELECT * FROM admin_portal_forms WHERE department = ? AND category = ? AND sub_category = ? AND standard = ?`,
      [department, category, subCategory, Standard]
    );
    res.json({ AdminFormsData: results });
  } catch (error) {
    console.error('Error fetching admin portal forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDepartments,
  getCategories,
  getSubCategories,
  getAdminPortalForms
};
