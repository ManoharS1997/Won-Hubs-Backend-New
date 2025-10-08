const { db } = require("../../config/DB-connection");
const decodeToken = require('../../utils/auth/DecodeAccessToken')
const { getOrganizationIdWithUserId } = require('../../helpers/findOrgId')
const defaultDepartments = require('../../shared/data/defaultdepartments')
const jwt = require("jsonwebtoken");


const getOrganizationDepartments = async (req, res) => {
  try {
    const { id } = decodeToken(req.headers['authorization'])
    const orgId = await getOrganizationIdWithUserId(id)
    const query = `SELECT * FROM department WHERE org_id = ?`
    const [departments] = await db.execute(query, [orgId])

    const finalDepartments = [
      ...defaultDepartments,
      ...departments
    ]

    res.status(200).json({ success: true, data: finalDepartments })
  } catch (err) {
    console.log('error getting the organizationdepartments', err)
    res.status(500).json({ success: false, message: err })
  }
}

// const AddDepartment = async (req, res) => {
//   try {
//     const departmentData = req.body;
//     console.log(departmentData, "body heree");

//     // 🔑 Decode JWT
//     const accessToken = req.headers["authorization"].split(" ")[1];
//     const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//     console.log(decoded, "decoded");

//     const userId = decoded.id;
//     const orgId = await getOrganizationIdWithUserId(userId);
//     console.log("orgId", orgId);
//     console.log("department Data ", departmentData);

//     // ✅ Insert query
//     const insertQuery = `
//       INSERT INTO department
//       (department_name, manager, contact_no, description, org_id)
//       VALUES (?, ?, ?, ?, ?)
//     `;

//     const values = [
//       departmentData.department_name,
//       departmentData.manager,
//       departmentData.phone,
//       departmentData.description,
//       orgId
//     ];

//     // ✅ use promise-based query
//     const [results] = await db.query(insertQuery, values);

//     console.log("Department inserted successfully", results);
//     res.json({ success: true, departmentId: results.insertId });

//   } catch (err) {
//     console.error("Error in AddDepartment:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// 🟢 Add new department
const AddDepartment = async (req, res) => {
  try {
    const departmentData = req.body;

    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const insertQuery = `
      INSERT INTO department 
      (department_name, description, manager, contact_no, active, org_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      departmentData.name || null,
      departmentData.description || null,
      departmentData.manager || null,
      departmentData.contact_no || null,
      departmentData.active || null,
      departmentData.org_id || orgId || null
    ];

    const [results] = await db.query(insertQuery, values);
    res.json({ success: true, departmentId: results.insertId });
  } catch (error) {
    console.error("Error inserting department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟡 Update department
const updateDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const updatedData = req.body;

    const updateQuery = `
      UPDATE department SET 
        department_name = ?, 
        description = ?, 
        manager = ?, 
        contact_no = ?, 
        active = ?
      WHERE department_id = ?
    `;

    const values = [
      updatedData.departmentName || null,
      updatedData.description || null,
      updatedData.manager || null,
      updatedData.contactNo || null,
      updatedData.active || null,
      departmentId
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ success: true, message: "Department updated successfully" });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟢 Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const [results] = await db.query("SELECT * FROM department WHERE department_id = ?", [departmentId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ department: results[0] });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔴 Delete department
const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const [results] = await db.query("DELETE FROM department WHERE department_id = ?", [departmentId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Department deleted successfully" });
    } else {
      return res.status(404).json({ error: "Department not found" });
    }
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  AddDepartment,
  updateDepartment,
  getDepartmentById,
  deleteDepartment,
  getOrganizationDepartments,

};



