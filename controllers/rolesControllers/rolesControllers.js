const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const jwt = require("jsonwebtoken");

// 🟢 Get role by ID
const getRoleById = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const [results] = await db.query("SELECT * FROM roles WHERE role_id = ?", [roleId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ role: results[0] });
  } catch (error) {
    console.error("Error fetching role details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟢 Add new role
const AddRole = async (req, res) => {
  try {
    const rolesData = req.body;

    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const insertQuery = `
      INSERT INTO roles (
        role_name, require_license, description, role_type,
        extended_roles, scope, permissions_summary,
        role_level, tags, org_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      rolesData.role_name || null,
      rolesData.require_license || null,
      rolesData.role_description || null,
      rolesData.role_type || null,
      rolesData.extended_roles || null,
      rolesData.scopes || null,
      rolesData.permission_summary || null,
      rolesData.role_level || null,
      rolesData.tags || null,
      orgId
    ];

    const [results] = await db.query(insertQuery, values);
    res.json({ success: true, roleId: results.insertId });
  } catch (err) {
    console.error("Error adding role:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟡 Update role
const updateRole = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const updatedRoleData = req.body;

    const updateQuery = `
      UPDATE roles SET 
        role_name = ?, 
        require_license = ?, 
        description = ?, 
        role_type = ?, 
        active = ?, 
        extended_roles = ?
      WHERE role_id = ?
    `;

    const values = [
      updatedRoleData.role_name || null,
      updatedRoleData.require_license || null,
      updatedRoleData.description || null,
      updatedRoleData.role_type || null,
      updatedRoleData.active || null,
      updatedRoleData.extended_roles || null,
      roleId
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔴 Delete role
const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const [results] = await db.query("DELETE FROM roles WHERE role_id = ?", [roleId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Role deleted successfully" });
    } else {
      return res.status(404).json({ error: "Role not found" });
    }
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  AddRole,
  updateRole,
  getRoleById,
  deleteRole
};
