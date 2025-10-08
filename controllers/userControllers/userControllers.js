
const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const jwt = require("jsonwebtoken");
const defaultdashboards = require('../../shared/UsersDefultData')
const nodemailer = require('nodemailer');
const formatDateToMySQLDateTime = require('../../helpers/formatDateString')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const decodeAccessToken = require("../../utils/auth/DecodeAccessToken");

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ORG_EMAIL,
    pass: process.env.ORG_EMAIL_PASS // App password for Gmail
  }
});

const sendExternalRegistrationMail = async (emailContent) => {
  const { email, firstName, lastName, username, password } = emailContent

  const mailOptions = {
    from: process.env.ORG_EMAIL,
    to: email,
    subject: 'Account creation',
    html: `<!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #de7309;
            color: white;
            padding: 20px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          .logo {
            height: 40px;
            margin-right: 15px;
          }
          .content {
            padding: 20px;
            font-size: 14px;
            color: #333;
          }
          .field {
            margin-bottom: 12px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 130px;
          }
          .value a {
            color: #003f7f;
            text-decoration: none;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #666;
            background-color: #f0f0f0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img
              class="logo"
              src="https://res.cloudinary.com/drtguvwir/image/upload/v1723878315/WON-Platform-Images/eurmlmdcs6exyfbtkh9o.png"
              alt="WONHUBS Logo"
            />
            New Account Creation - WONHUBS
          </div>
          <div class="content">
            <p>Hello ${firstName} ${lastName},</p>
            <p>You have succesfully registered for WONHUBS. Now use your credentials to login:</p>
            <p>Use this url: <a href="https://demo.wonhubs.com">demo.wonhubs.com</a></p>
            <p>Username: ${username}</p>
            <p>Password: ${password}</p>

            <p style="margin-top: 20px;">Note: Please keep your credentials confidential for your security purpose. Don't share or forward this mail with anyone!.</p>
          </div>
          <div class="footer">
            © 2025 WONHUBS. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    `,
    // text: `Email: ${email}\nCompany Name: ${companyName}\nDescription: ${description}\nFirst Name: ${firstName}\nLast Name: ${lastName}\nPhone Number: ${phoneNumber}\nPurpose: ${purpose}`
  }

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error sending email:', error);
      }
      console.log('Email sent:', info.response);
    });
    return { message: 'Email sent successfully' }
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'Failed to send email' }
  }
}

const sendOrganizationUserRegistrationMail = async (emailContent) => {
  const { email, firstName, lastName, username, password, instanceId } = emailContent;

  const mailOptions = {
    from: process.env.ORG_EMAIL,
    to: email,
    subject: 'Your WONHUBS Account Has Been Created',
    html: `<!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #003f7f;
            color: white;
            padding: 20px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          .logo {
            height: 40px;
            margin-right: 15px;
          }
          .content {
            padding: 20px;
            font-size: 14px;
            color: #333;
          }
          .footer {
            padding: 15px;
            font-size: 12px;
            color: #666;
            background-color: #f0f0f0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img
              class="logo"
              src="https://res.cloudinary.com/drtguvwir/image/upload/v1723878315/WON-Platform-Images/eurmlmdcs6exyfbtkh9o.png"
              alt="WONHUBS Logo"
            />
            Welcome to WONHUBS!
          </div>
          <div class="content">
            <p>Hello ${firstName} ${lastName},</p>
            <p>Your organization admin has created an account for you on WONHUBS.</p>
            <p>Login at: <a href="https://demo.wonhubs.com/login">demo.wonhubs.com</a></p>
            <p>Username: ${username}</p>
            <p>Password: ${password}</p>
            <p style="margin-top: 20px;">Please change your password after your first login and keep your credentials confidential.</p>
          </div>
          <div class="footer">
            © 2025 WONHUBS. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    `
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('Error sending email:', error);
      }
      console.log('Email sent:', info.response);
    });
    return { message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'Failed to send email' };
  }
};

const getOrgUsers = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"].split(" ")[1]
    // require("jsonwebtoken");
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const query = "SELECT * FROM users WHERE organization_id = ? AND active='true'";
    const values = [orgId];

    const [result] = await db.execute(query, values);
    // console.log('Decoded user ID:', result);

    if (result.length === 0) {
      return res.status(404).json({ message: "No users found for this organization." });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching organization users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

const createExternalUser = async (req, res, next) => {
  try {
    const { email, first_name, last_name, username, password, timezone } = req.body;
    const payload = {
      role_id: 80001008,
      organization_id: `Demo_${username}`,
      active: 'true',
      login_count: 0,
      mfa_enabled: 'false',
      selected_layout: '1',
      dashboard_layouts: JSON.stringify(defaultdashboards),
      created_at: formatDateToMySQLDateTime(new Date().toISOString()),
      reset_password: 'false',
      user_type: 'Admin',
      is_phone_verified: 0,
      subscription_status: 'non-subscriber',
      signup_date: formatDateToMySQLDateTime(new Date().toISOString())
    }

    if (!email || !first_name || !last_name || !username || !password) {
      return res.status(400).json({ message: "email, first_name, last_name, username, password, are required." });
    }

    // Check if user already exists
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE email = ? AND username = ?",
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists in this organization." });
    }

    // Insert new user
    // Merge body data into payload
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a random 4-character alphanumeric string
    function generateCode(length = 4) {
      return crypto.randomBytes(length)
        .map((b) => (b % 36).toString(36).toUpperCase())
        .join('');
    }

    const userPayload = {
      ...payload,
      email,
      first_name,
      last_name,
      username,
      password: hashedPassword,
      time_zone: timezone,
      instance_id: `dev-${username}${generateCode(4)}`,
    };

    // Insert new user with all relevant fields
    const [result] = await db.execute(
      `INSERT INTO users 
        (email, first_name, last_name, username, password, role_id, organization_id, active, login_count, mfa_enabled, selected_layout, dashboard_layouts, created_at, reset_password, user_type, is_phone_verified, subscription_status, signup_date, time_zone, instance_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userPayload.email,
        userPayload.first_name,
        userPayload.last_name,
        userPayload.username,
        userPayload.password,
        userPayload.role_id,
        userPayload.organization_id,
        userPayload.active,
        userPayload.login_count,
        userPayload.mfa_enabled,
        userPayload.selected_layout,
        userPayload.dashboard_layouts,
        userPayload.created_at,
        userPayload.reset_password,
        userPayload.user_type,
        userPayload.is_phone_verified,
        userPayload.subscription_status,
        userPayload.signup_date,
        userPayload.time_zone,
        userPayload.instance_id,
      ]
    );

    await sendExternalRegistrationMail({
      email: email,
      firstName: first_name,
      lastName: last_name,
      username: username,
      password: password
    })

    res.status(201).json({
      success: true,
      message: "External user created successfully.",
      userId: result.insertId
    });
  } catch (err) {
    console.log('error creating external user: ', err);
    res.status(500).json({ message: `Internal server error.${err}` });
  }
}

const creteOrganizationUser = async (req, res, next) => {
  try {
    const {
      user_type, title, last_name, first_name, department,
      email, phone_no, time_zone, date_format, photo, reset_password,
    } = req.body;

    if (!email || !first_name || !last_name || !department) {
      return res.status(400).json({ message: "email, first_name, last_name, department are required." });
    }

    const { id } = decodeAccessToken(req.headers['authorization'])
    const orgId = await getOrganizationIdWithUserId(id)


    // Check if user already exists in the organization
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE email = ? AND organization_id = ?",
      [email, orgId]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists in this organization." });
    }

    const [admins] = await db.execute(
      `SELECT id, username, instance_id, email, organization_id FROM users
       WHERE id = ? AND organization_id = ?`,
      [id, orgId])

    const admin = admins.length > 0 ? admins[0] : null

    // Generate a random password (8 characters, alphanumeric)
    const password = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a random username if not provided
    const generatedUsername = `${last_name}_${crypto.randomBytes(4).toString('hex')}`;
    const userPayload = {
      email,
      first_name,
      last_name,
      title,
      phone_no,
      username: generatedUsername,
      department,
      password: hashedPassword,
      role_id: 80001002,
      organization_id: orgId,
      active: 'true',
      login_count: 0,
      mfa_enabled: 'false',
      selected_layout: '1',
      // dashboard_layouts: JSON.stringify(defaultdashboards),
      created_at: formatDateToMySQLDateTime(new Date().toISOString()),
      reset_password: reset_password === '' ? 'false' : reset_password,
      user_type,
      is_phone_verified: 0,
      subscription_status: 'non-subscriber',
      signup_date: formatDateToMySQLDateTime(new Date().toISOString()),
      time_zone,
      instance_id: admin?.instance_id
    };

    const [result] = await db.execute(
      `INSERT INTO users 
        (email, first_name, last_name, title, username, department, password, role_id, 
        organization_id, active, login_count, mfa_enabled, selected_layout, created_at,
        reset_password, user_type, is_phone_verified, subscription_status, signup_date,
        time_zone, instance_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userPayload.email,
        userPayload.first_name,
        userPayload.last_name,
        userPayload.title,
        userPayload.username,
        userPayload.department,
        userPayload.password,
        userPayload.role_id,
        userPayload.organization_id,
        userPayload.active,
        userPayload.login_count,
        userPayload.mfa_enabled,
        userPayload.selected_layout,
        userPayload.created_at,
        userPayload.reset_password,
        userPayload.user_type,
        userPayload.is_phone_verified,
        userPayload.subscription_status,
        userPayload.signup_date,
        userPayload.time_zone,
        userPayload.instance_id,
      ]
    );

    await sendOrganizationUserRegistrationMail({
      email,
      firstName: first_name,
      lastName: last_name,
      username: generatedUsername,
      password: password,
      instanceId: admin.instance_id
    })

    res.status(201).json({
      success: true,
      message: "Organization user created successfully.",
      userId: result.insertId
    });
  } catch (err) {
    console.log('error creating organization user: ', err);
    res.status(500).json({ message: `Internal server error.${err}` });
  }
}

const getUserDashboards = async (req, res) => {
  try {
    const { id } = decodeAccessToken(req.headers['authorization'])
    const query = ` SELECT dashboard_layouts, selected_layout FROM users WHERE id = ${id}`

    const [results] = await db.execute(query)
    if (results.length > 0) {
      res.status(200).json({ success: true, data: results[0] })
    }
  } catch (err) {
    console.log('Error getting user dashboards')
    res.status(500).json({ success: false, message: err.message })
  }
}

// 🟢 Create a new user
const createUser = async (req, res) => {
  const userData = req.body;
  console.log("Triggering inside createUser", userData);

  try {
    const [results] = await db.query(
      `INSERT INTO users (
        active, department, email, first_name, last_name, location, 
        phone_no, reset_password, time_zone, title, user_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${userData.active}` || null,
        userData.department || null,
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.location || null,
        userData.phoneNo || null,
        `${userData.resetPassword}` || null,
        userData.timeZone || null,
        userData.title || null,
        userData.userType || null,
      ]
    );

    res.json({ success: true, userId: results.insertId });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 🟡 Update user details
const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const updatedUserData = req.body;

  try {
    const updateQuery = `
      UPDATE users SET 
        active = ?, 
        department = ?, 
        email = ?, 
        first_name = ?, 
        last_name = ?, 
        location = ?, 
        phone_no = ?, 
        reset_password = ?,  
        time_zone = ?, 
        title = ?,
        user_type = ?
      WHERE id = ?
    `;

    const values = [
      updatedUserData.active || null,
      updatedUserData.department || null,
      updatedUserData.email || null,
      updatedUserData.firstName || null,
      updatedUserData.lastName || null,
      updatedUserData.location || null,
      updatedUserData.phoneNo || null,
      updatedUserData.resetPassword || null,
      updatedUserData.timeZone || null,
      updatedUserData.title || null,
      updatedUserData.userType || null,
      userId,
    ];

    await db.query(updateQuery, values);
    res.json({ success: true, userId });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 🔵 Get user by ID
const getUserById = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: results[0] });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 🔴 Delete user
const deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [results] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = {
  getOrgUsers,
  createExternalUser,
  sendExternalRegistrationMail,
  creteOrganizationUser,
  getUserDashboards,
  createUser,
  updateUser,
  getUserById,
  deleteUser
};