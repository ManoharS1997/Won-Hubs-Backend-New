const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const jwt = require("jsonwebtoken");

// 🟢 Get all groups for the organization
const getOrgGroups = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;

    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const query = "SELECT * FROM group_names WHERE org_id = ? AND active = '1'";
    const values = [orgId];
    const [result] = await db.execute(query, values);

    if (result.length === 0) {
      return res.status(404).json({ message: "No groups found for this organization." });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching organization GROUPS:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// 🟢 Add new group
const AddGroup = async (req, res) => {
  console.log("Trigering Inside AddGroup");
  try {
    const groupData = req.body;
    console.log(req.body, "body heree");

    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded, "decoded");

    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    console.log("orgId", orgId);

    const insertQuery = `
      INSERT INTO group_names 
      (group_name, ownership, manager_name, email, group_type, parent_group, group_type_description, user_id, org_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      groupData.group_name,
      groupData.ownership,
      groupData.manager_name,
      groupData.email,
      groupData.group_type,
      groupData.parent_group,
      groupData.description, // stored as group_type_description
      userId,
      orgId,
    ];

    const [results] = await db.query(insertQuery, values);
    console.log(results, "results Heree");
    res.json({ success: true, groupId: results.insertId });
  } catch (err) {
    console.error("Error in AddGroup:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟡 Update group details
const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const updatedGroupData = req.body;

    const updateQuery = `
      UPDATE group_names SET 
        group_name = ?, 
        manager_name = ?, 
        email = ?, 
        parent_group = ?, 
        group_type_description = ?, 
        group_type = ?, 
        region = ?, 
        ownership = ?, 
        additional_managers = ?
      WHERE group_id = ?
    `;

    const values = [
      updatedGroupData.group_name || null,
      updatedGroupData.manager_name || null,
      updatedGroupData.email || null,
      updatedGroupData.parent_group || null,
      updatedGroupData.group_type_description || null,
      updatedGroupData.group_type || null,
      updatedGroupData.region || null,
      updatedGroupData.ownership || null,
      updatedGroupData.additional_managers || null,
      groupId,
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({ success: true, message: "Group updated successfully" });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔵 Get group by ID
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const [results] = await db.query("SELECT * FROM group_names WHERE group_id = ?", [groupId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({ group: results[0] });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔴 Delete group
const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const [results] = await db.query("DELETE FROM group_names WHERE group_id = ?", [groupId]);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Group deleted successfully" });
    } else {
      res.status(404).json({ error: "Group not found" });
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Export all functions
module.exports = {
  getOrgGroups,
  AddGroup,
  updateGroup,
  getGroupById,
  deleteGroup,
};
