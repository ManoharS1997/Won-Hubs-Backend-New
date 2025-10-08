
require('dotenv').config();
const { db } = require("../../config/DB-connection");
const axios = require("axios");
const { getConnectedClients } = require("../../socket/WebSocket.js");
const { getUserIdWithApiKey, getOrganizationIdWithApiKey } = require('../../helpers/findUserId.js')
const { getOrganizationIdWithUserId } = require('../../helpers/findOrgId.js')


let connectedClients = getConnectedClients()

// USERS table
const getActiveUsers = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const orgId = await getOrganizationIdWithUserId(userId)
    // console.log("userId: ", orgId);

    const query = `
      SELECT 
        username, role_id, first_name, last_name, title, department, active, 
        login_count, mfa_enabled, email, time_zone, phone_no, location, user_type,
        locale, is_phone_verified, subscription_status, subscription_expiration,
        last_login, last_activity, signup_date, account_age, actions_taken,payment_status,
        billing_address, subscription_start, subscription_end, action_timestamp,
        performed_by, action_type, ip_address, device_info
      FROM 
        users
      WHERE 
        organization_id = '${orgId}'
      AND 
        active = 'true'
      `
    const [activeUsers] = await db.execute(query);
    console.log("activeUsers: ", activeUsers);

    res.status(200).json({ success: true, data: activeUsers });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestUserCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const orgId = await getOrganizationIdWithUserId(userId)
    // console.log("userId: ", orgId);

    const query = `
              SELECT
                username, role_id, first_name, last_name, title, department, active, 
                login_count, mfa_enabled, email, time_zone, phone_no, location, user_type,
                locale, is_phone_verified, subscription_status, subscription_expiration,
                last_login, last_activity, signup_date, account_age, actions_taken,payment_status,
                billing_address, subscription_start, subscription_end, action_timestamp,
                performed_by, action_type, ip_address, device_info
              FROM
                users
              WHERE 
                organization_id = '${orgId}'
              AND 
                active = 'true'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestUser] = await db.execute(query);
    // console.log("latestUser: ", latestUser);
    res.status(200).json({ success: true, data: latestUser[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedUser = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const orgId = await getOrganizationIdWithUserId(userId)
    const query = `
        SELECT
          username, role_id, first_name, last_name, title, department, active, 
          login_count, mfa_enabled, email, time_zone, phone_no, location, user_type,
          locale, is_phone_verified, subscription_status, subscription_expiration,
          last_login, last_activity, signup_date, account_age, actions_taken, payment_status,
          billing_address, subscription_start, subscription_end, action_timestamp,
          performed_by, action_type, ip_address, device_info
        FROM
          users
        WHERE 
          id = '${id}' 
        AND 
          organization_id = '${orgId}'
        AND 
          active = 'true'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestUser] = await db.execute(query);
    res.status(200).json({ success: true, data: latestUser[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getUserAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const selectQuery = `
        SELECT 
          t.channel,
          t.state,
          t.on_behalf_of,
          t.service,
          t.short_description,
          t.active AS ticket_active,
          t.priority,
          t.assigned_members,
          t.task_type,
          u.username,
          u.first_name,
          u.last_name,
          u.department,
          u.active AS user_active
        FROM 
          users u
        JOIN 
          ticket t 
          ON JSON_CONTAINS(u.assigned_tickets, JSON_QUOTE(CAST(t.id AS CHAR)), '$')
        WHERE 
          u.id = '${id}'
        AND 
          u.active = 'true'
          `;
    // LIMIT 1;

    const [latestUser] = await db.execute(selectQuery);
    console.log(latestUser)
    res.status(200).json({ success: true, data: latestUser[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getLatestUserTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        username,
        first_name,
        last_name,
        department,
        active AS user_active ,
        tags
      FROM 
        users 
      WHERE 
          id = '${id}'
      AND 
        active = 'true'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}

// group_names table
const getActiveGroups = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    // const orgId = await getOrganizationIdWithUserId(userId)
    // console.log("userId: ", orgId);

    const query = `
      SELECT 
        id, role_id, user_id, email, parent_group, group_type_description,
        group_type, created_at, updated_at, member_count, plan, status, 
        timezone, primary_language, tags, settings
      FROM 
        group_names
      WHERE 
        user_id = '${userId}'
      AND 
        active = '1' 
      `
    const [activeGroups] = await db.execute(query);
    console.log("activeGroups: ", activeGroups);

    res.status(200).json({ success: true, data: activeGroups });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestGroupCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    // const orgId = await getOrganizationIdWithUserId(userId)
    // console.log("userId: ", orgId);

    const query = `
              SELECT
                id, role_id, user_id, email, parent_group, group_type_description,
                group_type, created_at, updated_at, member_count, plan, status, 
                timezone, primary_language, tags, settings
              FROM
                group_names
              WHERE 
                user_id = '${userId}'
              AND 
                active = '1'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestGroup] = await db.execute(query);
    res.status(200).json({ success: true, data: latestGroup[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedGroup = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const { id } = req.params; // Get userId from the request parameters
    const query = `
        SELECT
          id, role_id, user_id, email, parent_group, group_type_description,
          group_type, created_at, updated_at, member_count, plan, status, 
          timezone, primary_language, tags, settings
        FROM
          group_names
        WHERE 
          id = '${id}' 
        AND 
          user_id = '${userId}'
        AND 
          active = '1'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestGroup] = await db.execute(query);
    res.status(200).json({ success: true, data: latestGroup[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getGroupAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const selectQuery = `
        SELECT 
          t.channel,
          t.state,
          t.on_behalf_of,
          t.service,
          t.short_description,
          t.active AS ticket_active,
          t.priority,
          t.assigned_members,
          t.task_type,
          g.id,
          g.role_id,
          g.user_id, 
          g.email,
          g.parent_group,
          g.group_type_description,
          g.group_type,
          g.created_at,
          g.updated_at,
          g.member_count, 
          g.plan, 
          g.status, 
          g.timezone, 
          g.primary_language, 
          g.tags,
          g.settings
        FROM 
          group_names g
        JOIN 
          ticket t 
          ON JSON_CONTAINS(g.assigned_tickets, JSON_QUOTE(CAST(t.id AS CHAR)), '$')
        WHERE 
          g.id = '${id}'
        AND
          user_id = '${userId}'
        AND 
          g.active = '1'
          `;
    // LIMIT 1;

    const [latestGroup] = await db.execute(selectQuery);
    console.log(latestGroup)
    res.status(200).json({ success: true, data: latestGroup[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getLatestGroupTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        id,
        group_name,
        group_type,
        manager_name,
        active AS user_active ,
        tags
      FROM 
        group_names 
      WHERE 
        id = '${id}'
      AND
        user_id = '${userId}'
      AND 
        active = '1'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}


// department table
const getActiveDepartments = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)

    const query = `
      SELECT 
        id, department_name, description, manager, active, department_code,
        group_id, manager_user_id, created_at, updated_at, status, location,
        timezone, member_count, tags
      FROM 
        department
      WHERE 
        user_id = '${userId}'
      AND 
        active = 'true' 
      `
    const [activeDepartments] = await db.execute(query);
    console.log("activeGroups: ", activeDepartments);

    res.status(200).json({ success: true, data: activeDepartments });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestDepartmentCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const query = `
              SELECT
                id, department_name, description, manager, active, department_code,
                group_id, manager_user_id, created_at, updated_at, status, location,
                timezone, member_count, tags
              FROM
                department
              WHERE 
                user_id = '${userId}'
              AND
                active = 'true'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestDepartment] = await db.execute(query);
    res.status(200).json({ success: true, data: latestDepartment[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedDepartment = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const query = `
        SELECT
          id, department_name, description, manager, active, department_code,
          group_id, manager_user_id, created_at, updated_at, status, location,
          timezone, member_count, tags
        FROM
          department
        WHERE 
          id = '${id}' 
        AND 
          user_id = '${userId}'
        AND 
          active = 'true'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestDepartment] = await db.execute(query);
    console.log("latest updated department", latestDepartment);

    res.status(200).json({ success: true, data: latestDepartment[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};

// this function is not a good idea
const getDepartmentAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters

    const selectQuery = `
        SELECT 
          t.channel,
          t.state,
          t.on_behalf_of,
          t.service,
          t.short_description,
          t.active AS ticket_active,
          t.priority,
          t.assigned_members,
          t.task_type,
          g.id,
          g.role_id,
          g.user_id, 
          g.email,
          g.parent_group,
          g.group_type_description,
          g.group_type,
          g.created_at,
          g.updated_at,
          g.member_count, 
          g.plan, 
          g.status, 
          g.timezone, 
          g.primary_language, 
          g.tags,
          g.settings
        FROM 
          group_names g
        JOIN 
          ticket t 
          ON JSON_CONTAINS(g.assigned_tickets, JSON_QUOTE(CAST(t.id AS CHAR)), '$')
        WHERE 
          g.id = '${id}'
        AND 
          g.active = '1'
          `;
    // LIMIT 1;

    const [latestGroup] = await db.execute(selectQuery);
    console.log(latestGroup)
    res.status(200).json({ success: true, data: latestGroup[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};

const getLatestDepartmentTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        id,
        department_name,
        description,
        manager,
        active AS user_active,
        tags
      FROM 
        department 
      WHERE 
        id = '${id}'
      AND
        user_id = '${userId}'
      AND 
        active = 'true'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0]?.tags?.[0] || []
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: tag } });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Internal server error", message: err });
  }
}


// roles table
const getActiveRoles = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
      SELECT
        id, role_name, require_license, description, role_type, active,
        extended_roles, created_at, updated_at, is_default, assignable,
        scope, permissions_summary, role_level, tags
      FROM 
        roles
      WHERE 
        org_id = '${orgId}'
      AND 
        active = '1' 
      `
    const [activeRoles] = await db.execute(query);
    console.log("activeRoles: ", activeRoles);

    res.status(200).json({ success: true, data: activeRoles });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestRoleCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
              SELECT
                id, role_name, require_license, description, role_type, active,
                extended_roles, created_at, updated_at, is_default, assignable,
                scope, permissions_summary, role_level, tags
              FROM
                roles
              WHERE 
                org_id = '${orgId}'
              AND 
                active = '1'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestRole] = await db.execute(query);
    res.status(200).json({ success: true, data: latestRole[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedRole = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    const { id } = req.params; // Get userId from the request parameters
    const query = `
        SELECT
          id, role_name, require_license, description, role_type, active,
          extended_roles, created_at, updated_at, is_default, assignable,
          scope, permissions_summary, role_level, tags
        FROM
          roles
        WHERE 
          id = '${id}' 
        AND 
          org_id = '${orgId}'
        AND 
          active = '1'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestRole] = await db.execute(query);
    res.status(200).json({ success: true, data: latestRole[0] });
  } catch (err) {
    console.log('on role update error:', err);

    res.status(500).json({ error: "Internal server error", message: err });
  }
};

// this function is not a good idea
const getRoleAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const selectQuery = `
        SELECT 
          t.channel,
          t.state,
          t.on_behalf_of,
          t.service,
          t.short_description,
          t.active AS ticket_active,
          t.priority,
          t.assigned_members,
          t.task_type,
          g.id,
          g.role_id,
          g.user_id, 
          g.email,
          g.parent_group,
          g.group_type_description,
          g.group_type,
          g.created_at,
          g.updated_at,
          g.member_count, 
          g.plan, 
          g.status, 
          g.timezone, 
          g.primary_language, 
          g.tags,
          g.settings
        FROM 
          group_names g
        JOIN 
          ticket t 
          ON JSON_CONTAINS(g.assigned_tickets, JSON_QUOTE(CAST(t.id AS CHAR)), '$')
        WHERE 
          g.id = '${id}'
        AND
          user_id = '${userId}'
        AND 
          g.active = '1'
          `;
    // LIMIT 1;

    const [latestGroup] = await db.execute(selectQuery);
    console.log(latestGroup)
    res.status(200).json({ success: true, data: latestGroup[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};

const getLatestRoleTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    // console.log("userId: ", orgId);
    const query = `
      SELECT 
          id, role_name, require_license, description, role_type, 
          extended_roles, created_at, updated_at, is_default, assignable,
          scope, permissions_summary, role_level,
          active AS user_active ,
          tags
      FROM 
        roles 
      WHERE 
        id = '${id}'
      AND
        org_id = '${orgId}'
      AND 
        active = '1'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}

// tasks table
const getActiveTasks = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    // const orgId = await getOrganizationIdWithUserId(userId)
    // console.log("userId: ", orgId);

    const query = `
      SELECT 
        id, name, on_behalf_of, status, approval_state, short_description,
        description, public_comments, active,priority, requsted_email, departed,
        state, assigned_members, approved_by, requested_by, task_type, attachments,
        price_per_unit, quantity, title, due_date, start_date, created_at, updated_at,
        created_by_user_id, assigned_to_user_id, group_id,department_id, tags,
        estimated_hours, custom_fields
      FROM 
        tasks
      WHERE 
        org_id = '${orgId}'
      AND 
        active = '1' 
      `
    const [activeTasks] = await db.execute(query);
    console.log("activeGroups: ", activeTasks);

    res.status(200).json({ success: true, data: activeTasks });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestTaskCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)


    const query = `
              SELECT
                id, name, on_behalf_of, status, approval_state, short_description,
                description, public_comments, active,priority, requsted_email, departed,
                state, assigned_members, approved_by, requested_by, task_type, attachments,
                price_per_unit, quantity, title, due_date, start_date, created_at, updated_at,
                created_by_user_id, assigned_to_user_id, group_id,department_id, tags,
                estimated_hours, custom_fields
              FROM
                tasks
              WHERE 
                org_id = '${orgId}'
              AND 
                active = '1'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestTask] = await db.execute(query);
    res.status(200).json({ success: true, data: latestTask[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedTask = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    const { id } = req.params; // Get userId from the request parameters
    const query = `
        SELECT
          id, name, on_behalf_of, status, approval_state, short_description,
          description, public_comments, active,priority, requsted_email, departed,
          state, assigned_members, approved_by, requested_by, task_type, attachments,
          price_per_unit, quantity, title, due_date, start_date, created_at, updated_at,
          created_by_user_id, assigned_to_user_id, group_id,department_id, tags,
          estimated_hours, custom_fields
        FROM
          tasks
        WHERE 
          id = '${id}' 
        AND 
          org_id = '${orgId}'
        AND 
          active = '1'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestTask] = await db.execute(query);
    res.status(200).json({ success: true, data: latestTask[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getTaskAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const selectQuery = `
        SELECT 
          t.id, 
          t.name,
          t.on_behalf_of,
          t.status, 
          t.approval_state,
          t.short_description,
          t.description, 
          t.requsted_email,
          t.created_by_user_id,
          t.assigned_to_user_id, 
          t.group_id,
          t.department_id,
          t.tags,
          t.estimated_hours,
          t.custom_fields,
          u.username,
          u.first_name,
          u.last_name,
          u.department,
          u.active AS user_active
        FROM 
          users u
        JOIN 
          tasks t 
          ON JSON_CONTAINS(u.assigned_tasks, JSON_QUOTE(CAST(t.id AS CHAR)), '$')
        WHERE 
          t.org_id = '${orgId}'
        AND 
          u.active = 'true'
          `;
    // LIMIT 1;

    const [latestTask] = await db.execute(selectQuery);
    console.log(latestTask)
    res.status(200).json({ success: true, data: latestTask[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getLatestTaskTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        id, name, on_behalf_of, status, approval_state, short_description,
        description, public_comments, priority, requsted_email, title,
        active AS user_active, tags
      FROM 
        tasks 
      WHERE 
        id = '${id}'
      AND
        org_id = '${orgId}'
      AND 
        active = '1'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}


// locations table
const getActiveLocations = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
      SELECT 
        id, location_name, street, city, state, postal_code, contact,
        phone_no, fax_no, parent_location, location_code, type, address_line1,
        address_line2, country_code, timezone, latitude, longitude, active,
        created_at, updated_at, tags
      FROM 
        location
      WHERE 
        org_id = '${orgId}'
      AND 
        active = '1' 
      `
    const [activelocations] = await db.execute(query);
    console.log("activeGroups: ", activelocations);

    res.status(200).json({ success: true, data: activelocations });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestLocationCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
              SELECT
                id, location_name, street, city, state, postal_code, contact,
                phone_no, fax_no, parent_location, location_code, type, address_line1,
                address_line2, country_code, timezone, latitude, longitude, active,
                created_at, updated_at, tags
              FROM
                location
              WHERE 
                org_id = '${orgId}'
              AND 
                active = '1'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestLocation] = await db.execute(query);
    res.status(200).json({ success: true, data: latestLocation[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedLocation = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const { id } = req.params; // Get userId from the request parameters
    const query = `
        SELECT
          id, location_name, street, city, state, postal_code, contact,
          phone_no, fax_no, parent_location, location_code, type, address_line1,
          address_line2, country_code, timezone, latitude, longitude, active,
          created_at, updated_at, tags
        FROM
          location
        WHERE 
          id = '${id}' 
        AND 
          org_id = '${orgId}'
        AND 
          active = '1'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestLocation] = await db.execute(query);
    res.status(200).json({ success: true, data: latestLocation[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
//------------
const getLocationAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Get userId from the request parameters
    const { api_key, api_token } = req.query
    const userId = await getUserIdWithApiKey(api_key)
    const selectQuery = `
        SELECT 
          t.channel,
          t.state,
          t.on_behalf_of,
          t.service,
          t.short_description,
          t.active AS ticket_active,
          t.priority,
          t.assigned_members,
          t.task_type,
          g.id,
          g.role_id,
          g.user_id, 
          g.email,
          g.parent_group,
          g.group_type_description,
          g.group_type,
          g.created_at,
          g.updated_at,
          g.member_count, 
          g.plan, 
          g.status, 
          g.timezone, 
          g.primary_language, 
          g.tags,
          g.settings
        FROM 
          group_names g
        JOIN 
          ticket t 
          ON JSON_CONTAINS(g.assigned_tickets, JSON_QUOTE(CAST(t.id AS CHAR)), '$')
        WHERE 
          g.id = '${id}'
        AND
          user_id = '${userId}'
        AND 
          g.active = '1'
          `;
    // LIMIT 1;

    const [latestGroup] = await db.execute(selectQuery);
    console.log(latestGroup)
    res.status(200).json({ success: true, data: latestGroup[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
//-----------
const getLatestLocationTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        id, location_name, street, city, state, postal_code, contact,
        phone_no, fax_no, parent_location, location_code, type, address_line1,
        address_line2, country_code, timezone, latitude, longitude,
        created_at, updated_at, tags, active AS user_active
      FROM 
        location
      WHERE 
        id = '${id}'
      AND
        org_id = '${orgId}'
      AND 
        active = '1'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    console.log('error getting location tags: ', err);

    res.status(500).json({ error: "Internal server error", message: err });
  }
}


// cmdb table
const getActiveCMDB = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
      SELECT 
        id, ci_name, tags, ci_description, company, serial_number, model_number
        operating_system, os_domain, version, service_pack, storage, manufacturer,
        relationship_id, ci_id, ci_name, ci_type, ci_code, status, environment, owner_user_id,
        group_id, location_id, ip_address, hostname, relationships, created_at,  updated_at
      FROM 
        cmdb
      WHERE 
        org_id = '${orgId}'
      AND
        active = '1' 
      `
    const [activeCMDB] = await db.execute(query);
    // console.log("activeCMDB: ", activeCMDB);

    res.status(200).json({ success: true, data: activeCMDB });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestCMDBCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
              SELECT
                id, ci_name, tags, ci_description, company, serial_number, model_number
                operating_system, os_domain, version, service_pack, storage, manufacturer,
                relationship_id, ci_id, ci_name, ci_type, ci_code, status, environment, owner_user_id,
                group_id, location_id, ip_address, hostname, relationships, created_at,  updated_at
              FROM
                cmdb
              WHERE 
                org_id = '${orgId}'
              AND 
                active = '1'
              ORDER BY 
                created_at DESC
              LIMIT 1;
          `

    const [latestCMDB] = await db.execute(query);
    res.status(200).json({ success: true, data: latestCMDB[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedCMDB = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    const { id } = req.params; // Get userId from the request parameters
    const query = `
        SELECT
          id, ci_name, tags, ci_description, company, serial_number, model_number
          operating_system, os_domain, version, service_pack, storage, manufacturer,
          relationship_id, ci_id, ci_name, ci_type, ci_code, status, environment, owner_user_id,
          group_id, location_id, ip_address, hostname, relationships, created_at,  updated_at
        FROM
          cmdb
        WHERE 
          id = '${id}' 
        AND 
          org_id = '${orgId}'
        AND 
          active = '1'
        ORDER BY 
          updated_at DESC
        LIMIT 1;
      `;

    const [latestCMDB] = await db.execute(query);
    res.status(200).json({ success: true, data: latestCMDB[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getCMDBAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query;
    const orgId = await getOrganizationIdWithApiKey(api_key);

    // Example: Find all tickets assigned to this CMDB item (configuration item)
    const selectQuery = `
      SELECT 
        c.id AS cmdb_id,
        c.group_id,
        c.org_id,
        c.assigned_member,
        c.ci_name,
        c.ci_type,
        c.status AS ci_status
      FROM 
        cmdb c 
      WHERE 
        c.id = '${id}'
      AND 
        c.org_id = '${orgId}'
      AND 
        c.active = '1'
    `;

    const [assignments] = await db.execute(selectQuery);
    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getLatestCMDBTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        id, ci_name, tags, ci_description, company, serial_number, model_number
        operating_system, os_domain, version, service_pack, storage, manufacturer,
        relationship_id, ci_id, ci_name, ci_type, ci_code, status, environment, owner_user_id,
        group_id, location_id, ip_address, hostname, relationships, created_at,  updated_at,
        active AS user_active ,
        tags
      FROM 
        cmdb 
      WHERE 
        id = '${id}'
      AND
        org_id = '${orgId}'
      AND 
        active = '1'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}


// ticket table
const getActiveTickets = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    const query = `
      SELECT 
        id, name, channel, state, action_plan, internal_notes, external_notes, on_behalf_of,
        category, sub_category, service, status, approval_state, short_description, description,
        private_comments, public_comments, active, priority, requested_email, department,
        assigned_members, approved_by, requested_by, task_type, attachments, price_per_unit,
        quantity, assigned_group, created_by, solution_due_date, subject, created_on,
        subject, description, status, priority,  updated_on, closed_on,
        group_id, tags, attachments, channel
      FROM 
        ticket
      WHERE 
        org_id = '${orgId}'
      AND 
        active = 'true' 
      `
    const [activeTickets] = await db.execute(query);
    console.log("activeTickets: ", activeTickets);

    res.status(200).json({ success: true, data: activeTickets });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error });
  }
}
const latestTicketCreated = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)

    const query = `
              SELECT
                id, name, channel, state, action_plan, internal_notes, external_notes, on_behalf_of,
                category, sub_category, service, status, approval_state, short_description, description,
                private_comments, public_comments, active, priority, requested_email, department,
                assigned_members, approved_by, requested_by, task_type, attachments, price_per_unit,
                quantity, assigned_group, created_by, solution_due_date, subject, created_on,
                subject, description, status, priority,  updated_on, closed_on,
                group_id, tags, attachments, channel
              FROM
                ticket
              WHERE 
                org_id = '${orgId}'
              AND 
                active = 'true'
              ORDER BY 
                created_on DESC
              LIMIT 1;
          `

    const [latestTicket] = await db.execute(query);
    res.status(200).json({ success: true, data: latestTicket[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}
const latestUpdatedTicket = async (req, res) => {
  try {
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    const { id } = req.params; // Get userId from the request parameters
    const query = `
        SELECT
          id, name, channel, state, action_plan, internal_notes, external_notes, on_behalf_of,
          category, sub_category, service, status, approval_state, short_description, description,
          private_comments, public_comments, active, priority, requested_email, department,
          assigned_members, approved_by, requested_by, task_type, attachments, price_per_unit,
          quantity, assigned_group, created_by, solution_due_date, subject, created_on,
          subject, description, status, priority,  updated_on, closed_on,
          group_id, tags, attachments, channel
        FROM
          ticket
        WHERE 
          id = '${id}' 
        AND 
          org_id = '${orgId}'
        AND 
          active = 'true'
        ORDER BY 
          updated_on DESC
        LIMIT 1;
      `;

    const [latestTicket] = await db.execute(query);
    res.status(200).json({ success: true, data: latestTicket[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getTicketAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Ticket ID from request parameters
    const { api_key, api_token } = req.query;
    const orgId = await getOrganizationIdWithApiKey(api_key);

    // Find all users assigned to this ticket
    const selectQuery = `
      SELECT 
        u.id AS user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.department,
        u.active AS user_active,
        t.id AS ticket_id,
        t.name AS ticket_name,
        t.status AS ticket_status,
        t.short_description,
        t.assigned_members,
        t.group_id,
        t.tags
      FROM 
        users u
      JOIN 
        ticket t 
        ON JSON_CONTAINS(t.assigned_members, JSON_QUOTE(CAST(u.id AS CHAR)), '$')
      WHERE 
        t.id = '${id}'
      AND 
        t.org_id = '${orgId}'
      AND 
        t.active = 'true'
      AND
        u.active = 'true'
    `;

    const [assignedUsers] = await db.execute(selectQuery);
    res.status(200).json({ success: true, data: assignedUsers });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
};
const getLatestTicketTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_token } = req.query
    const orgId = await getOrganizationIdWithApiKey(api_key)
    // console.log("userId: ", orgId);
    const query = `
      SELECT 
        id, name, channel, state, action_plan, 
        category, sub_category, status,  short_description, 
         priority, requested_email, 
        active AS user_active, tags
      FROM 
        ticket 
      WHERE 
        id = '${id}'
      AND
        org_id = '${orgId}'
      AND 
        active = 'true'
    `
    const [latestTag] = await db.execute(query);
    console.log(latestTag);
    const tag = latestTag[0].tags[0]
    res.status(200).json({ success: true, data: { ...latestTag[0], tags: [tag] } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: err });
  }
}


module.exports = {
  getActiveUsers,
  latestUserCreated,
  latestUpdatedUser,
  getUserAssignment,
  getLatestUserTag,

  getActiveGroups,
  latestGroupCreated,
  latestUpdatedGroup,
  getGroupAssignment,
  getLatestGroupTag,

  getActiveDepartments,
  latestDepartmentCreated,
  latestUpdatedDepartment,
  getDepartmentAssignment,
  getLatestDepartmentTag,

  getActiveRoles,
  latestRoleCreated,
  latestUpdatedRole,
  getRoleAssignment,
  getLatestRoleTag,

  getActiveTasks,
  latestTaskCreated,
  latestUpdatedTask,
  getTaskAssignment,
  getLatestTaskTag,

  getActiveLocations,
  latestLocationCreated,
  latestUpdatedLocation,
  getLocationAssignment,
  getLatestLocationTag,

  getActiveCMDB,
  latestCMDBCreated,
  latestUpdatedCMDB,
  getCMDBAssignment,
  getLatestCMDBTag,

  getActiveTickets,
  latestTicketCreated,
  latestUpdatedTicket,
  getTicketAssignment,
  getLatestTicketTag,
};