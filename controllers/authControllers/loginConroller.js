// require('dotenv').config();
const { db } = require("../../config/DB-connection");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const decodeToken = require("../../utils/auth/DecodeAccessToken");
const { generateAccessToken, generateRefreshToken } = require("../../utils/auth/generateTokens");

// ✅ In-memory OTP store (instead of Redis)
const otpStore = {};

// ⏱️ Set OTP expiry (5 minutes)
const setOtp = (email, otp) => {
  otpStore[email] = otp.toString();
  setTimeout(() => {
    delete otpStore[email];
  }, 5 * 60 * 1000); // 5 minutes
};

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ORG_EMAIL,
    pass: process.env.ORG_EMAIL_PASS
  }
});

// Route to handle sending OTP via email
const sendOtpViaEmail = async (email) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const mailOptions = {
    from: 'testmail@nowitservices.com',
    to: email,
    subject: 'Your OTP for Verification',
    text: `Your OTP for changing your password is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    setOtp(email, otp);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const verifyOtp = async (email, otp) => {
  const storedOtp = otpStore[email];
  console.log(otpStore)
  if (!storedOtp) {
    return { success: false, message: 'OTP expired or not found' };
  }
  console.log('Stored OTP:', storedOtp, 'User OTP:', otp);
  if (storedOtp === otp.toString()) {
    delete otpStore[email]; // Clean up after success
    return { success: true, message: 'OTP verified successfully' };
  } else {
    return { success: false, message: 'Invalid OTP' };
  }
};

const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

const findUsername = async (req, res) => {
  const { username } = req.body;
  try {
    const sql = `SELECT * FROM users WHERE BINARY username = ?`;
    const [results] = await db.execute(sql, [username]);
    const user = results[0];
    if (!user) {
      return res.status(400).json({ message: "Username not found" });
    }
    return res.json({ success: true, userFound: true, name: user.first_name + ' ' + user.last_name });
  } catch (error) {
    console.log('Error finding username:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const sql = `
      SELECT id, username, password, mfa_enabled, login_count, mfa_type, instance_id, category, subcategory,view, department
      FROM wonhubs.users
      WHERE username = ?
    `;
    const [results] = await db.query(sql, [username]);

    if (!results || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log(user,"User,,.")
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        mfa_enabled: user.mfa_enabled,
        mfa_type: user.mfa_type,
        login_count: user.login_count,
        instanceId: user.instance_id,
        category:user?.category||"category",
        subcategory:user.subcategory,
        view:user.view,
        department:user.department,
      },
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateLoginCount = async (req, res) => {
  try {
    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const query = `UPDATE users SET login_count = login_count + 1 WHERE id = ? AND organization_id = ?`;
    const [result] = await db.execute(query, [userId, orgId]);
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Login count updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found or organization mismatch' });
    }

  } catch (err) {
    console.log("error updating login count: ", err);
    res.status(500).json({ success: false, message: `'error updating login count: ${err}'` });
  }
};

const checkPasswordAndSendEmailOTP = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id } = decodeToken(req.headers["authorization"]);
    const [user] = await db.execute("SELECT id, password, email FROM users WHERE id = ?", [id]);
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (isMatch) {
      const isSend = await sendOtpViaEmail(user[0].email);
      if (isSend) {
        res.status(200).json({ success: true, message: 'OTP sent to email' });
      } else {
        res.status(500).json({ success: false, message: 'Error sending OTP' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }

  } catch (error) {
    console.error('Error checking password and sending email OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const verifyEmailOTP = async (req, res, next) => {
  try {
    const { otp, new_password } = req.body;
    const { id } = decodeToken(req.headers["authorization"]);
    const [user] = await db.execute("SELECT email FROM users WHERE id = ?", [id]);
    const email = user[0]?.email;
    const result = await verifyOtp(email, otp);
    if (result.success) {
      const hasshedPassword = await bcrypt.hash(new_password, 10)
      const [result] = await db.execute("UPDATE users SET password = ? where id = ?", [hasshedPassword, id])
      if (result.affectedRows > 0) {
        res.status(200).json({ success: true, message: "Password updated  successfully" });
      } else {
        res.status(400).json({ success: false, message: "Failed to update password" })
      }
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const checkInstanceId = async (req, res, next) => {
  try {
    const { instanceId } = req.body;
    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const [userResult] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.instance_id !== instanceId) {
      return res.status(400).json({ message: 'Instance ID does not match' });
    }

    next();
  } catch (error) {
    console.error('Error checking instance ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  findUsername,
  updateLoginCount,
  checkPasswordAndSendEmailOTP,
  verifyEmailOTP,
};
