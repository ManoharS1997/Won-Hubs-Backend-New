const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");
const redis = require("redis");
const WebSocket = require("ws");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const path = require("path");
const soap = require("soap");
const xml2js = require("xml2js");
const fs = require("fs").promises;
const userService = require("../soap-service");
require("dotenv").config();
const https = require("https");
const { addClient, removeClient } = require("../socket/WebSocket.js");
const mongoose = require("mongoose");

const wsdlPath = path.join(__dirname, "user-service.wsdl");

const authenticateToken = require("../utils/auth/authorization");

const decodeAccessToken = require("../utils/auth/DecodeAccessToken.js");
const { getOrganizationIdWithUserId } = require("../helpers/findOrgId.js");

const zendeskConnectionRoutes = require("../routes/connectionRoutes/zendesk-routes");
const zapierConnectionRoutes = require("../routes/connectionRoutes/zapier-routes");
const slackConnectionRoutes = require("../routes/connectionRoutes/slack-routes");
const trelloConnectionRoutes = require("../routes/connectionRoutes/trello-routes");
const testSoapRoutes = require("../routes/soapRoutes/soapTestRoutes");
const loginRoutes = require("../routes/authRoutes/loginRoutes");
const tokenRoutes = require("../routes/authRoutes/tokenRoutes");
const webhookRoutes = require("../routes/webhookRoutes/webhook-routes");
const apiKeysRoutes = require("../routes/apiKeysRoutes/apiKeysRoutes");
const sharedRoutes = require("../routes/shared/shared.js");
const cmdbRoutes = require("../routes/cmdbRoutes/cmdbRoutes");
const relationsRoutes = require("../routes/cmdbRelRoutes/cmdbRelRoutes");
const userRoutes = require("../routes/users/userRoutes");
const groupRoutes = require("../routes/groups/groupRoutes");
const locationsRoutes = require("../routes/locations/locationsRoutes");
const departmentsRoutes = require("../routes/departmentRoutes/departmentRoutes");
const s3Routes = require("../routes/s3Routes/S3Routes");
const partnerRoutes = require("../routes/Partners/PartnerRoutes.js");
const formDesignerRoutes = require("../routes/formDesigner/formDesignerRoutes");
const app = express();
const PORT = process.env.PORT || 3002;
const upload = multer({ dest: "uploads/" });

// Initialize Redis Client
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error("Redis Error:", err));

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Handle DB Pool Errors
pool.on("error", (err) => {
  console.error("Database Pool Error:", err);
});
// Database Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // port: process.env.DB_PORT,
  connectTimeout: process.env.DB_CONNECTION_TIMEOUT,
});

const allowedOrigins = process.env.ALLOWED_URLS?.split(",");
const corsOptions = {
  origin: (origin, callback) => {
    if ((origin && allowedOrigins.includes(origin)) || origin === undefined) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Include cookies and credentials
};

// Enable CORS with specific origin and headers
// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "500mb" }));
app.use(cookieParser());
app.use(express.raw({ type: () => true }));

// Serve Static Files
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mjs")) {
        res.setHeader("Content-Type", "text/javascript");
      }
    },
  })
);

// API Routes
app.use("/api", sharedRoutes);
app.use("/api/zendesk/connections", zendeskConnectionRoutes);
app.use("/api/zapier/connections", zapierConnectionRoutes);
app.use("/api/slack/connections", slackConnectionRoutes);
app.use("/api/trello/connections", trelloConnectionRoutes);
app.use("/api/connections/soap", testSoapRoutes);
app.use("/api/admin/login", loginRoutes);
app.use("/api/admin/token", tokenRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/api-keys", apiKeysRoutes);
app.use("/api/cmdb", cmdbRoutes);
app.use("/api/cmdb-rel", relationsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/department", authenticateToken, departmentsRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/partners", partnerRoutes);
app.use("/api/form-designer", formDesignerRoutes);

// JWT Authentication Middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.status(401).send('Invalid Token');

//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.SECRET_KEY, (err) => {
//     if (err) return res.status(401).send('Invalid Access Token');
//     next();
//   });
// };

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> EMIT ALERT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// emit the alert
function EmitAlert(alert) {
  console.log("Alert triggered:", alert); // Log the alert

  // Optional: Save to an events table in your database
  Events.create({
    type: alert.type,
    message: alert.message,
    metadata: JSON.stringify(alert.data),
    timestamp: new Date(),
  });

  // Optional: Send to a monitoring or messaging system
  // e.g., publish to Google Pub/Sub
  publishToPubSub(alert);
}

// Start the Gmail watch process
function startWatch(auth) {
  const gmail = google.gmail({ version: "v1", auth });

  gmail.users.watch(
    {
      userId: "me",
      requestBody: {
        labelIds: ["INBOX", "UNREAD"],
        topicName:
          "projects/won-platform-423505/topics/test-gmail-subscription", // Replace with your topic
      },
    },
    (err, res) => {
      if (err) return console.error("Error starting watch:", err);
      console.log("Watch response:", res.data);
    }
  );
}

// Handle incoming Pub/Sub notifications
app.post("/gmail-webhook", async (req, res) => {
  try {
    const pubsubMessage = req.body.message;

    // Check if Pub/Sub message exists
    if (!pubsubMessage) {
      console.error("Bad Request: No Pub/Sub message found.");
      res.status(400).send("Bad Request: No Pub/Sub message found.");
      return;
    }
    // console.log(pubsubMessage)

    // Decode the Pub/Sub message
    const rawData = Buffer.from(pubsubMessage.data, "base64").toString();
    // console.log('Decoded message:', rawData);

    let data;
    try {
      // Attempt to parse JSON
      data = JSON.parse(rawData);
    } catch (err) {
      // console.warn('Received non-JSON message:', rawData);
      // Respond gracefully if the message is not JSON
      res.status(400).send("Bad Request: Invalid JSON payload.");
      return;
    }

    console.log("New Gmail notification received:", data);

    // Extract the history ID from the parsed JSON
    const historyId = data.historyId;
    if (!historyId) {
      console.error("No historyId found in the Pub/Sub message.");
      res.status(400).send("Bad Request: No historyId found in the message.");
      return;
    }

    // Authorize and fetch new emails using the history ID
    try {
      const authClient = await authorize(); // Ensure `authorize` is an async function
      fetchRecentEmails(authClient, historyId); // Pass `authClient` and historyId
      console.log("Emails fetched successfully.");
    } catch (err) {
      console.error("Error fetching new emails:", err);
      res.status(500).send("Internal Server Error: Failed to fetch emails.");
      return;
    }

    // Respond with success
    res.status(200).send("Notification received and processed.");
  } catch (err) {
    // Catch unexpected errors
    console.error("Error processing Pub/Sub notification:", err);
    res.status(500).send("Internal Server Error.");
  }
});

async function fetchEmailById(auth, messageId, historyId) {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });

    // console.log('comparing historyId:', response.data, historyId.toString());
    // if (response.data.historyId === historyId.toString()) {
    return getEmailContent(auth, messageId);
    // }
    // return { err: 'not matched' };
  } catch (error) {
    console.error("Error fetching email by ID:", error);
  }
}

async function fetchRecentEmails(auth, historyId) {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread", // Filter for unread emails
      maxResults: 2, // Adjust as needed
    });

    const messages = response.data.messages || [];
    console.log(`Fetched ${messages.length} recent emails.`);

    const newEmailsData = [];

    for (const message of messages) {
      // console.log('Fetching details for message ID:', message.id);
      const fetchedEmailData = await fetchEmailById(
        auth,
        message.id,
        historyId
      );
      // console.log(fetchedEmailData)

      newEmailsData.push(fetchedEmailData);
    }
    console.log("latest emails:", newEmailsData);
  } catch (error) {
    console.error("Error fetching recent emails:", error);
  }
}

// Fetch new emails using Gmail history
function listNewEmails(auth, historyId) {
  const gmail = google.gmail({ version: "v1", auth });

  gmail.users.history.list(
    {
      userId: "me",
      startHistoryId: historyId,
    },
    (err, res) => {
      if (err) {
        console.error("Error fetching email history:", err);
        return;
      }

      const history = res.data.history || [];
      console.log("history: ", res.data);
      history.forEach((historyItem) => {
        if (historyItem.messagesAdded) {
          historyItem.messagesAdded.forEach((message) => {
            const messageId = message.message.id;
            console.log("New email ID:", messageId);

            // Fetch detailed email content
            getEmailContent(auth, messageId);
          });
        }
      });
    }
  );
}

// Fetch email content by message ID
function getEmailContent(auth, messageId) {
  console.log("getting email content");
  const gmail = google.gmail({ version: "v1", auth });

  gmail.users.messages.get(
    {
      userId: "me",
      id: messageId,
    },
    (err, res) => {
      if (err) {
        console.error("Error fetching email content:", err);
        return;
      }

      const message = res.data;
      const headers = message.payload.headers;

      // Extract subject and sender from headers
      const subject =
        headers.find((header) => header.name === "Subject")?.value ||
        "No Subject";
      const from =
        headers.find((header) => header.name === "From")?.value ||
        "Unknown Sender";

      console.log("New Email Details:");
      console.log("From:", from);
      console.log("Subject:", subject);

      // Decode the email body (if available)
      const body = getBody(message.payload);
      console.log("Body:", body);
    }
  );
}

// Helper function to extract the email body
function getBody(payload) {
  let encodedBody = "";

  if (payload.parts) {
    encodedBody =
      payload.parts.filter((part) => part.mimeType === "text/plain")[0]?.body
        ?.data || "";
  } else {
    encodedBody = payload.body?.data || "";
  }

  // Decode the base64url string
  const buffer = Buffer.from(encodedBody, "base64");
  return buffer.toString("utf-8");
}

// api to verify the loginKey
// app.get('/verify-login-key', (req, res) => {
//   const { loginKey, username } = req.body

//   const verifyQuery = `SELECT username FROM users WHERE username=${username} AND login_key=${loginKey}`

//   connection.query(verifyQuery, (err, result) => {
//     if (err) {
//       res.status(400).json({ error: 'invalid Key' })
//     }

//     res.send({ success: result.length > 0 })
//   })
// })

// ######################################################################## TO GET ALL TABLE NAMES ###############################################################
// api to get all the table names in the database
app.get("/get-table-names", authenticateToken, async (req, res) => {
  try {
    connection.query("SHOW TABLES", (error, results, fields) => {
      if (error) throw error;

      const tableNames = results.map((row) => {
        return row[fields[0].name];
      });

      return res.json(tableNames);
    });
  } catch (err) {
    console.error("Error getting table names:", err);
  }
});

// ########################################################################  ANY TABLE DATA  #####################################################################
//  API to get any Table Data

// #######################################################################  to get any record data ###############################################################

// ------------------------------------------------------- CREATE NEW RECORD IN ANY TABLE ---------------------------------------------------------

// Custom API endpoint to create a new record in any table
app.post("/createRecord/:tableName", authenticateToken, (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  try {
    const { tableName } = req.params;
    const { recordData, eventData } = req.body;
    // console.log('New Event Data:', eventData)

    if (!tableName || !recordData || typeof recordData !== "object") {
      console.log("Invalid input data");
      return res.status(400).send("Invalid input data");
    }

    const columns = Object.keys(recordData);
    const values = Object.values(recordData).map((value) =>
      typeof value === "object" ? JSON.stringify(value) : value
    );

    const placeholders = columns.map(() => "?").join(", ");

    const sql = `INSERT INTO wonhubs.?? (${columns.join(
      ", "
    )}) VALUES (${placeholders})`;

    connection.query(sql, [tableName, ...values], (error, results) => {
      if (error) {
        console.log("Error:", error);
        return res.status(500).json({ sucess: false, error: error.message });
      }
      console.log("record created");
      res.send({ success: true, message: "Record created successfully" });

      // if (!eventData) {
      //   // Trigger alerts for specific tables (e.g., tickets)
      //   if (tableName === 'ticket') {
      //     createEvent({ ...eventData, title: 'Created New Record' })
      //     createEvent({ ...eventData, title: 'New ticket creation Alert', category: 'alert' })
      //     const monitoredReport = monitorTicket(recordData)
      //     // console.log('ticket monitored data: ', monitoredReport.isCritical)
      //     monitoredReport?.isCritical ?
      //       createEvent({ ...eventData, title: 'Critical Ticket Reported', category: 'alert' }) : null
      //   } else {
      //     createEvent({ ...eventData, title: 'Created New Record' })
      //   }
      // }
    });
  } catch (err) {
    console.log("Database error: " + err.message);
  }
});

// API to test a new record in any table before actual insertion
app.post("/testRecord/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const { recordData } = req.body;

  if (!tableName || !recordData || typeof recordData !== "object") {
    return res
      .status(400)
      .json({ success: false, errors: ["Invalid input data"] });
  }

  // Get column metadata from the database
  const schemaQuery = `SHOW COLUMNS FROM wonhubs.??`;
  connection.query(schemaQuery, [tableName], (schemaError, schemaResults) => {
    if (schemaError) {
      return res.status(500).json({
        success: false,
        errors: ["Database error: " + schemaError.message],
      });
    }

    const errors = [];
    const tableSchema = schemaResults.map((col) => ({
      name: col.Field,
      type: col.Type,
      isNullable: col.Null === "YES",
      isPrimaryKey: col.Key === "PRI",
      hasDefault: col.Default !== null,
    }));

    // Validate each field in the recordData against the schema
    for (const column of tableSchema) {
      const value = recordData[column.name];

      // Check for missing required fields (NOT NULL constraint)
      if (
        !column.isNullable &&
        value === undefined &&
        !column.hasDefault &&
        !column.isPrimaryKey
      ) {
        errors.push(`Missing required field: ${column.name}`);
      }

      // Check type mismatches (basic validation)
      if (value !== undefined) {
        if (column.type.includes("int") && isNaN(Number(value))) {
          errors.push(
            `Invalid data type for field '${column.name}': Expected integer.`
          );
        } else if (
          column.type.includes("varchar") &&
          typeof value !== "string"
        ) {
          errors.push(
            `Invalid data type for field '${column.name}': Expected string.`
          );
        } else if (
          column.type.includes("datetime") &&
          isNaN(Date.parse(value))
        ) {
          errors.push(
            `Invalid data type for field '${column.name}': Expected date/time format.`
          );
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Proceed with transaction to test insertion
    const columns = Object.keys(recordData);
    const values = Object.values(recordData).map((value) =>
      typeof value === "object" ? JSON.stringify(value) : value
    );
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO wonhubs.?? (${columns.join(
      ", "
    )}) VALUES (${placeholders})`;

    connection.beginTransaction((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, errors: ["Database error: " + err.message] });
      }

      connection.query(sql, [tableName, ...values], (error) => {
        if (error) {
          errors.push(error.message);
        }

        // Rollback transaction to prevent actual insertion
        connection.rollback(() => {
          if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
          }
          res.json({
            success: true,
            message: "Validation passed, but no record was inserted.",
          });
        });
      });
    });
  });
});

// ------------------------------------------------------- UPDATE ANY TABLE RECORD WITH SPECIFIC COLUMNS AND IT'S VALUES -----------------------------------------------
// Custom API endpoint to update columns and their values
app.put("/updateRecord/:tableName/:id", authenticateToken, (req, res) => {
  const { tableName, id } = req.params;
  const { recordData, eventData } = req.body;

  console.log(
    "updated record data: ",
    tableName,
    !id,
    !recordData,
    typeof recordData !== "object"
  );
  if (!tableName || !id || !recordData || typeof recordData !== "object") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }

  const setClauses = [];
  const values = [];

  for (const [column, value] of Object.entries(recordData)) {
    setClauses.push(`${column} = ?`);
    values.push(typeof value === "object" ? JSON.stringify(value) : value);
  }

  const sql = `UPDATE wonhubs.?? SET ${setClauses.join(", ")} WHERE id = ?`;
  values.push(id);

  connection.query(sql, [tableName, ...values], (error, results) => {
    // console.log(error)
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error: " + error.message });
    }
    res
      .status(200)
      .json({ success: true, message: "Record updated successfully" });

    // if (eventData) {
    //   // Trigger alerts for specific tables (e.g., tickets)
    //   if (tableName === 'ticket') {
    //     createEvent({ ...eventData, title: 'Updated Record' })
    //     createEvent({ ...eventData, title: 'Ticket Updation Alert', category: 'alert' })
    //     const monitoredReport = monitorTicket(recordData)
    //     // console.log('ticket monitored data: ', monitoredReport.isCritical)
    //     monitoredReport?.isCritical ?
    //       monitoredReport?.approvalStatus ?
    //         createEvent({ ...eventData, title: `Ticket Approval ${monitoredReport.approvalStatus === true ? 'Approved' : 'Rejected'}`, category: 'alert' }) :
    //         createEvent({ ...eventData, title: 'Critical Ticket Reported', category: 'alert' }) : null
    //   } else {
    //     createEvent({ ...eventData, title: 'Updated Record' })
    //   }
    // }
  });
});

// ------------------------------------------------------ DELETE ANY RECORD -------------------------------------------------------------------
// API TO DELETE RECORD IN ANY TABLE
app.delete("/deleteRecord/:table/:id", (req, res) => {
  const table = req.params.table; // Get the table name from the URL
  const id = req.params.id; // Get the record ID from the URL
  const { eventData } = req.body;

  // Input validation (optional, you can implement more strict rules based on your needs)
  if (!table || !id) {
    console.log("Invalid table name or ID");
    return res.status(400).json({ error: "Invalid table name or ID" });
  }

  // Ensure the table and id are sanitized
  const query = `DELETE FROM wonhubs.?? WHERE id = ?`;

  // Execute the query
  connection.query(query, [table, id], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      console.log("error deleting record:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }

    if (result.affectedRows === 0) {
      console.log("Deleting Record not found");
      return res.status(404).json({ message: "Record not found" });
    }

    if (eventData) {
      // Trigger alerts for specific tables (e.g., tickets)
      if (table === "ticket") {
        createEvent({ ...eventData, title: "Deleted Record" });
        createEvent({
          ...eventData,
          title: "Ticket Deletion Alert",
          category: "alert",
        });
      } else if (table === "event_logs") {
        createEvent({ ...eventData, title: "Deleted Record" });
        createEvent({
          ...eventData,
          title: "Event Record Deletion Alert",
          category: "alert",
        });
      } else {
        createEvent({ ...eventData, title: "Deleted Record" });
      }
    }
    console.log(`Record with ID ${id} deleted from ${table} successfully.`);
    return res.status(200).json({
      message: `Record with ID ${id} deleted from ${table} successfully.`,
    });
  });
});

// ------------------------------------------------------- VERIFY THE LOGIN KEY ------------------------------------------------------------------
// API to verify the loginKey
app.post("/verify-login-key", (req, res) => {
  const { loginkey, username } = req.body;
  console.log(loginkey, username);

  try {
    const sql = `SELECT * FROM wonhubs.users WHERE username = '${username}'`;

    connection.query(sql, async (error, results) => {
      if (error) {
        return res.status(500).send("Database error: " + error.message);
      }

      if (results.length === 0) {
        return res.status(400).send("Invalid login Key");
      }

      const user = results[0];
      if (!user) {
        return res.status(401).json({ message: "Invalid Login Key" });
      }

      // const hashedPassword = bcrypt.hash(user.password, 10, (err, hash) => {})
      // const isMatch = await bycrypt.compare(password, user.password)
      const isMatch = user.login_key === loginkey;
      console.log(isMatch);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid Login Key" });
      }

      res.json({ isLoginKeyVerified: true });
    });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------------------------------------------------ UPDATE THE SELECTED COLUMNS ------------------------------------------------------------
// API TO UPDATE THE selected columns for the table
app.put("/update-selected-columns", (req, res) => {
  const { tableName, columnValue } = req.body;
  // console.log(tableName, columnValue)
  try {
    const sql = `UPDATE wonhubs.table_selected_columns SET selected_columns = '${columnValue}' WHERE table_name='${tableName}'`;

    connection.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        // return res.status(500).send('Database error: ' + err.message);
      }

      res.send({ success: "selected columns updated" });
    });
  } catch (err) {
    console.log(err);
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SIGNUP APIs <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// api to register to wonhubs.

app.post("/wonhub/register", (req, res) => {
  try {
    const { newUserDetails } = req.body;
  } catch (e) {
    console.log(e);
  }
});

// API to send otp to email
app.post("/get/email-otp", async (req, res) => {
  try {
    const { email, eventData } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: "testmail@nowitservices.com",
      to: email,
      subject: "Wonhub OTP",
      text: `Your OTP for wonhub Registration is ${otp}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email OTP sent successfully");

    // Store OTP in Redis
    // const storeOtpInRedis = async (email, otp) => {
    //   const expirationTimeInSeconds = 300; // OTP valid for 5 minutes (300 seconds)

    //   try {
    //     // Store OTP in Redis with expiration
    //     await redisClient.set(`otp:${email}`, otp, {
    //       EX: expirationTimeInSeconds,
    //     });
    //     console.log(`OTP stored for ${email}`);
    //   } catch (error) {
    //     console.error("Error storing OTP in Redis", error);
    //     throw new Error("Could not store OTP");
    //   }
    // };

    // await storeOtpInRedis(email,  otp)

    res.status(200).json({ message: "Email sent successfully", tempOtp: otp });

    if (eventData) {
      createEvent({
        ...eventData,
        title: `Email OTP has been successfully sent to ${email}.`,
        category: "email",
      });
      createEvent({
        ...eventData,
        title: `Email OTP sent alert.`,
        category: "email",
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});

// api to check if the username is available or not
app.post("/check-username", (req, res) => {
  const { userName } = req.body;
  const query = `SELECT * FROM wonhubs.users WHERE username = '${userName}'`;
  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
    }
    res.send({ usernameFound: result.length > 0 });
  });
});

// api to check if the email is already in use or not
app.post("/is-email-avilable", (req, res) => {
  const { email } = req.body;
  try {
    const query = `SELECT email FROM wonhubs.users WHERE email = '${email}'`;
    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: err });
      }

      res.send({ isEmailAvailable: result.length > 0 });
    });
  } catch (err) {
    console.log(err);
  }
});

// api to get userdata by username

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> LOGIN API <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// API to authenticate the user
// app.post('/wonhub/login', async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: 'Username and password are required' });
//   }

//   try {
//     // Fetch only required fields (id, username, password)
//     const sql = `SELECT
//                   id, username, password,mfa_enabled, login_count, mfa_type
//                   FROM wonhubs.users WHERE username = '${username}'
//                   `;
//     // const [results] = await connection.execute(sql, [username]);
//     connection.query(sql, async (error, results) => {
//       console.log('found users:', results, username)
//       if (results?.length === 0) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }

//       const user = results[0];

//       const isMatch = user.password === password// await bycrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }

//       const token = jwt.sign(
//         { id: user.id, username: user.username },
//         SECRET_KEY,
//         { expiresIn: '24h' }
//       );

//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'Strict',
//       });

//       // Only return non-sensitive user details
//       res.json({
//         token, user: {
//           id: user.id,
//           username: user.username,
//           mfa_enabled: user.mfa_enabled,
//           mfa_type: user.mfa_type,
//           login_count: user.login_count
//         }
//       });
//     })
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

//api to get user data by username
app.get("/wonhub/get-user-data/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const sql = `SELECT * FROM wonhubs.users WHERE username = '${username}'`;
    connection.query(sql, async (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ DatabaseError: error.message });
      }

      const user = results[0];
      return res.json({ user });
    });
  } catch (error) {
    console.log("Error finding username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ########################################################## authenticator APIs #################################################################
// Endpoint to generate TOTP secret and QR code
app.get("/generate", (req, res) => {
  const secret = speakeasy.generateSecret({
    name: "WONHUBS", // Replace with your app's name
  });
  console.log("generating qr code");
  qrUserCodes.push(secret);
  qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) {
      return res.status(500).send("Error generating QR code");
    }

    res.json({
      secret: secret.base32, // Store this in your database
      qrCode: dataUrl,
    });
  });
});

// Endpoint to validate OTP
app.post("/validate", (req, res) => {
  const { token, secret } = req.body;
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // Allows for some clock drift
  });
  console.log("verifying secret", isValid);

  if (isValid) {
    res.send("Token is valid!");
  } else {
    res.status(400).send("Invalid token");
  }
});

// ####################################################################### TABLE COLUMN NAMES ########################################################

// Get column names of a table

// ######################################################################## EMAIL LOG ######################################################################
// API to fetch record details by record ID
app.get("/emails-read", (req, res) => {
  // const recordId = req.params.recordId;
  const query = "SELECT * FROM email_log ";

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching record details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Mails not found" });
    }

    const records = results.map((mail) => ({
      bcc: mail.bcc,
      body: mail.body,
      cc: mail.cc,
      date: mail.date,
      event: mail.event,
      from: mail.from_address,
      to: mail.to_address,
      last_updated: mail.last_updated,
      message_id: mail.message_id,
      status: mail.status,
      subject: mail.subject,
      tags: mail.tags,
    }));
    res.json(records);
  });
});

app.post("/email-log/newEmail", (req, res) => {
  const newEmailData = req.body;
  const recordId = req.params.emailId;

  function formatDateToMySQLDateTime(dateString) {
    // Parse the given date string
    const date = new Date(dateString);

    // Get the individual date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    // Construct the MySQL datetime string
    // const mysqlDateTime = '2024-07-01 11:45:06.000000'
    // `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    const mysqlDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    return mysqlDateTime;
  }
  const insertQuery = `
    INSERT INTO email_log (
      event, date, from_address, to_address, tags, body, status, cc, bcc, last_updated, subject, message_id, email_logcol
    ) VALUES (
      ${newEmailData.event || null},
      '${formatDateToMySQLDateTime(newEmailData.date) || null}', 
      '${newEmailData.fromAddress || null}', 
      '${newEmailData.toAddress}', 
      '${newEmailData.tags || null}', 
      '${newEmailData.body || null}',
      '${newEmailData.status || null}', 
      '${newEmailData.cc || null}', 
      '${newEmailData.bcc}', 
      '${"2024-07-01 11:45:06.000000"}',
      '${newEmailData.subject || null}',
      '${newEmailData.messageId || null}',
      '${newEmailData.emailLogCol || null}'
    )
    ON DUPLICATE KEY UPDATE message_id = VALUES(message_id)
  `;

  connection.query(insertQuery, (error, results) => {
    if (error) {
      console.error("Error inserting email:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Email inserted successfully");
    res.json({ success: true, recordId: recordId });
  });
});

//  Update the email details
app.put("/email-log/update/:emailId", (req, res) => {
  const updatedEmailData = req.body;
  const recordId = req.params.emailId;

  // ticket_id = ${updatedTicketData.ticket_id || null},

  const updateQuery = `
    UPDATE email_log SET 
      event = ${updatedEmailData.event || null},
      date = '${updatedEmailData.date || null}', 
      from_address = '${updatedEmailData.fromAddress || null}', 
      to_address = '${updatedEmailData.toAddress}', 
      tags = '${updatedEmailData.tags || null}', 
      body = '${updatedEmailData.body || null}',
      status = '${updatedEmailData.status || null}', 
      cc = '${updatedEmailData.cc || null}', 
      bcc = '${updatedEmailData.bcc}', 
      last_updated = '${updatedEmailData.lastUpdated || null}',
      subject = '${updatedEmailData.subject || null}',
      message_id = '${updatedEmailData.messageId || null}',
      email_logcol = '${updatedEmailData.emailLogCol || null}',
    WHERE email_log.email_log_id=${recordId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating email:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Email Updated successfully");
    res.json({ success: true, recordId: recordId });
  });
});

// API to fetch email record details by ID
app.get("/email-log/:emailId", (req, res) => {
  const recordId = req.params.emailId;

  // Query the 'email_log' table by ticket ID
  const query = "SELECT * FROM email_log WHERE email_log_id = ?";

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error fetching email details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Email Record not found" });
    }

    const record = results[0];
    res.json({ record });
  });
});

//  Api to delete email record
app.delete("/email-log/delete/:emailId", (req, res) => {
  const recordId = req.params.emailId;

  // Query to delete the email record based on ID
  const deleteQuery = "DELETE FROM email_log WHERE email_log_id = ?";
  connection.query(deleteQuery, [recordId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting email record:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (ticket deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Email Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Email Record not found" });
    }
  });
});

app.emit("fetchEmails");

// #################################################################### LINKEDIN API #######################################################################
app.get("/api/linkedin", async (req, res) => {
  console.log(req);
  try {
    let data = "";

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.linkedin.com/v2/userinfo",
      headers: {
        Authorization:
          "Bearer AQU0_J1HVsw1FXOh48Ptcb0f6YcZb7-njogNKh4rPsSTRy4icN4Hhg_XHPVPX483k3ne_Mr4IMBvo1MXpLFhDFKBNU4jp6tLJoQcz5qQaWqVkEuP09pOCsKbM8Be1oVDIxlrXnxW4wL2DbbnIwv-go8MzPVNgLJGXpVrDl0YeJFpLQg2IFdJDmwHmA7nDV5bEAbW_LJK8AiA8AYZH4luW113tm9JQFtDf1Welr6KE6Xxb490n_cjh8mAGLxugY14Icpsbdk2CUVsl0rt_l5SU_icfMD91pBMNSEsdlDq362OKDLLQrBx9Uf5X8sb6eTFqUR1D4XANZc_flYTzqi5u46pnv0gZw",
        Cookie: 'bcookie="v=2&5aa422b1-3830-4760-8943-6b9bc2deb5e7"',
      },
      data: data,
    };

    const response = await axios.request(config);
    res.json(response.data);
    // console.log(res.json(response.data))
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Initial fetch
// app.emit('fetchEmails')

// ######################################################################### TICKET ######################################################
//    Tickets table APIs

// Add a new ticket with specific columns
app.post("/ticket/newTicket", (req, res) => {
  const ticketData = req.body;
  console.log(ticketData.channel);

  // Insert the new ticket into the 'ticket' table
  const insertQuery = `
    INSERT INTO ticket (
    name,
    on_behalf_of, 
    category, 
    sub_category, 
    service,
    status,
    approval_state, 
    short_description, 
    description,
    private_comments,
    public_comments, 
    active, 
    history, 
    priority, 
    requested_email, 
    department,
    state, 
    assigned_member, 
    approved_by, 
    requested_by,
    task_type,
    attachments,
    price_per_unit, 
    quantity,
    channel
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  const values = [
    ticketData.name || null,
    ticketData.on_behalf_of || null,
    ticketData.category || null,
    ticketData.sub_category || null,
    ticketData.service || null,
    ticketData.status || null,
    ticketData.approval_state || null,
    ticketData.short_description || null,
    ticketData.description || null,
    ticketData.private_comments || null,
    ticketData.public_comments || null,
    ticketData.active || null,
    ticketData.history || null,
    ticketData.priority || null,
    ticketData.requested_email || null,
    ticketData.department || null,
    ticketData.state || null,
    ticketData.assigned_member || null,
    ticketData.approved_by || null,
    ticketData.requested_by || null,
    ticketData.task_type || null,
    ticketData.attachments || null,
    ticketData.price_per_unit || null,
    ticketData.quantity || null,
    ticketData.channel || null,

    // ticketData.ticketNo || null,
    // ticketData.status || null,
    ticketData.shortDescription || null,
    // ticketData.description || null,
    ticketData.requestedEmail || null,
    ticketData.active || null,
    // ticketData.category || null,
    // ticketData.state || null,
    ticketData.taskType || null,
    ticketData.attachment || null,
    // ticketData.category || null,
    // ticketData.name || null,
    // ticketData.service || null,
    ticketData.subCategory || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting ticket:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Ticket inserted successfully");
    res.json({ success: true, ticketId: results.insertId });
  });
});

//  Update the ticket details
app.put("/ticket/update/:ticketId", (req, res) => {
  const updatedTicketData = req.body;
  const ticketId = req.params.ticketId;

  // ticket_id = ${updatedTicketData.ticket_id || null},

  const updateQuery = `
    UPDATE ticket SET 
      ticket_no = ${updatedTicketData.ticket_no || null},
      service = '${updatedTicketData.service || null}', 
      status = '${updatedTicketData.status || null}', 
      approval_state = '${updatedTicketData.approval_state}', 
      short_description = '${updatedTicketData.short_description || null}', 
      description = '${updatedTicketData.description || null}',
      private_comments = '${updatedTicketData.private_comments || null}', 
      public_comments = '${updatedTicketData.public_comments || null}', 
      active = '${updatedTicketData.active}', 
      history = '${updatedTicketData.history || null}'
    WHERE ticket.ticket_id=${ticketId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating ticket:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Ticket Updated successfully");
    res.json({ success: true, ticketId: ticketId });
  });
});

// API to fetch ticket details by ticket ID
app.get("/ticket/:id", (req, res) => {
  const ticketId = req.params.id;

  // Query the 'ticket' table by ticket ID
  const query = "SELECT * FROM wonhubs.ticket WHERE id = ?";

  connection.query(query, [ticketId], (error, results) => {
    if (error) {
      console.error("Error fetching ticket details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticket = results[0];
    res.json({ ticket });
  });
});

//  Api to delete ticket
app.delete("/ticket/delete/:ticketId", (req, res) => {
  const ticketId = req.params.ticketId;

  // Query to delete the ticket based on ticket ID
  const deleteQuery = "DELETE FROM ticket WHERE ticket_id = ?";
  connection.query(deleteQuery, [ticketId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting ticket:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (ticket deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Ticket deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Ticket not found" });
    }
  });
});

// ######################################################################### USERS ######################################################
//    Users table APIs

// Add a new user with specific columns
app.post("/users/newUser", (req, res) => {
  const userData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!userData || !userData.email || !userData.first_name || !userData.last_name) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new user into the 'users' table
  const insertQuery = `
    INSERT INTO users (active, department, email, first_name, last_name, location, 
      phone_no, reset_password,  time_zone, title, user_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
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
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("User inserted successfully");
    res.json({ success: true, userId: results.insertId });
  });
});

//  Update the user details
app.put("/users/update/:userId", (req, res) => {
  const updatedUserData = req.body;
  const userId = req.params.userId;

  // if (!updatedUserData || !updatedUserData.email || !updatedUserData.first_name || !updatedUserData.last_name) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  const updateQuery = `
    UPDATE users SET 
      active = '${updatedUserData.active}', 
      department = ${
        updatedUserData.department ? `'${updatedUserData.department}'` : null
      }, 
      email = '${updatedUserData.email}', 
      first_name = '${updatedUserData.firstName}', 
      last_name = '${updatedUserData.lastName}', 
      location = ${
        updatedUserData.location ? `'${updatedUserData.location}'` : null
      }, 
      phone_no = ${
        updatedUserData.phoneNo ? `'${updatedUserData.phoneNo}'` : null
      }, 
      reset_password = '${updatedUserData.resetPassword}',  
      time_zone = ${
        updatedUserData.timeZone ? `'${updatedUserData.timeZone}'` : null
      }, 
      title = ${updatedUserData.title ? `'${updatedUserData.title}'` : null}
    WHERE users.id = ${parseInt(userId)}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("User updated successfully");
    res.json({ success: true, userId: userId });
  });
});

// API to fetch user details by user ID
app.get("/users/:userId", (req, res) => {
  const userId = req.params.userId;

  // Query the 'users' table by user ID
  const query = "SELECT * FROM users WHERE id = ?";

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    res.json({ user });
  });
});

//  Api to delete User
app.delete("/users/delete/:userId", (req, res) => {
  const userId = req.params.userId;
  // Query to delete the user based on userId
  const deleteQuery = "DELETE FROM users WHERE user_id = ?";
  connection.query(deleteQuery, [userId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (user deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "User deleted successfully" });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  });
});

// ######################################################################### GROUP_NAMES ######################################################
//    Group table APIs

// Add a new group with specific columns
app.post("/groups/newGroup", (req, res) => {
  const groupData = req.body;

  // Insert the new group into the 'groups' table
  const insertQuery = `
    INSERT INTO group_names (group_name, manager_name, email, parent_group, group_type_description, group_type, region)
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    groupData.groupName || null,
    groupData.manager,
    groupData.email,
    groupData.parentGroup,
    groupData.groupTypeDescription || null,
    groupData.groupType ? groupData.groupType : null,
    groupData.region || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting group:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Group inserted successfully");
    res.json({ success: true, groupId: results.insertId });
  });
});

//  Update the group details
app.put("/groups/update/:groupId", (req, res) => {
  const updatedGroupData = req.body;
  const groupId = req.params.groupId;

  // if (!updatedUserData || !updatedUserData.email || !updatedUserData.first_name || !updatedUserData.last_name) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  const updateQuery = `
    UPDATE group_names SET 
      group_id = '${updatedGroupData.groupId || null}', 
      group_name = '${updatedGroupData.groupName || null}', 
      manager_name = '${updatedGroupData.managerName || null}', 
      email = '${updatedGroupData.email || null}',
      parent_group = '${updatedGroupData.parentGroup || null}', 
      group_type_description = '${
        updatedGroupData.groupTypeDescription || null
      }', 
      group_type = '${updatedGroupData.groupType || null}', 
      region = '${updatedGroupData.region || null}'
    WHERE group_names.group_id=${groupId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating group:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Group Updated Successfully");
    res.json({ success: true, groupId: results.insertId });
  });
});

// API to fetch Group details by group ID
app.get("/groups/:groupId", (req, res) => {
  const groupId = req.params.groupId;

  // Query the 'users' table by group ID
  const query = "SELECT * FROM group_names WHERE group_id = ?";

  connection.query(query, [groupId], (error, results) => {
    if (error) {
      console.error("Error fetching group details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const group = results[0];
    res.json({ group });
  });
});

//  Api to delete group
app.delete("/groups/delete/:groupId", (req, res) => {
  const groupId = req.params.groupId;
  // Query to delete the user based on userId
  const deleteQuery = "DELETE FROM group_names WHERE group_id = ?";
  connection.query(deleteQuery, [groupId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting group:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (user deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Group deleted successfully" });
    } else {
      return res.status(404).json({ error: "Group not found" });
    }
  });
});

// ######################################################################## ROLES ########################################################
//    Roles table APIs

// Add a new role with specific columns
app.post("/roles/newRole", (req, res) => {
  const rolesData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!rolesData || !rolesData.role_id || !rolesData.active || !rolesData.role_type) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new user into the 'roles' table
  const insertQuery = `
    INSERT INTO roles ( role_name, require_license, description, role_type, active, extended_roles)
    VALUES ( ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    rolesData.role_name,
    rolesData.require_license || null,
    rolesData.description,
    rolesData.role_type.toString(),
    rolesData.active || null,
    rolesData.extended_roles || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting role:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Role inserted successfully");
    res.json({ success: true, roleId: results.insertId });
  });
});

//  Update the role details
app.put("/roles/update/:roleId", (req, res) => {
  const updatedRoleData = req.body;
  const roleId = req.params.roleId;

  // if (!updatedRoleData || !updatedRoleData.role_id || !updatedRoleData.role_name || !updatedRoleData.active) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  const updateQuery = `
    UPDATE roles SET 
      role_name = '${updatedRoleData.role_name || null}',
      require_license = '${updatedRoleData.require_license || null}', 
      description = '${updatedRoleData.description || null}', 
      role_type = '${updatedRoleData.role_type || null}', 
      active = '${updatedRoleData.active || null}' , 
      extended_roles = '${updatedRoleData.extended_roles || null}'
    WHERE roles.role_id = '${roleId}' 
  `;
  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating role:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Role Updated successfully");
    res.json({ success: true, roleId: results.insertId });
  });
});

// API to fetch role details by role ID
app.get("/roles/:roleId", (req, res) => {
  const roleId = req.params.roleId;

  // Query the 'users' table by user ID
  const query = "SELECT * FROM roles WHERE role_id = ?";

  connection.query(query, [roleId], (error, results) => {
    if (error) {
      console.error("Error fetching role details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    const role = results;
    res.json({ role });
  });
});

//  Api to delete role
app.delete("/roles/delete/:roleId", (req, res) => {
  const roleId = req.params.roleId;

  // Query to delete the role based on roleId
  const deleteQuery = "DELETE FROM roles WHERE role_id = ?";

  connection.query(deleteQuery, [roleId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting role:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (role deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Role deleted successfully" });
    } else {
      return res.status(404).json({ error: "Role not found" });
    }
  });
});

// ######################################################################## COMPANY ########################################################
//    Company table APIs

// Add a new company with specific columns
app.post("/company/newCompany", (req, res) => {
  const companyData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!companyData || !companyData.company_id || !companyData.company_name || !companyData.phone_no) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new company into the 'company' table
  const insertQuery = `
    INSERT INTO company  
      (company_name, street, city, state, postal_code, phone_no, fax_no, currency)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ? )
  `;

  const values = [
    (company_name = companyData.companyName || null),
    (street = companyData.street || null),
    (city = companyData.city || null),
    (state = companyData.state || null),
    (postal_code = companyData.postalCode || null),
    (phone_no = companyData.phoneNo || null),
    (fax_no = companyData.faxNo || null),
    (currency = companyData.currency || null),
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting company:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Company inserted successfully");
    res.json({ success: true, companyId: results.insertId });
  });
});

//  Update the company details
app.put("/company/update/:companyId", (req, res) => {
  const updatedCompanyData = req.body;
  const companyId = req.params.companyId;

  // if (!updatedCompanyData || !updatedCompanyData.company_id || !updatedCompanyData.company_name || !updatedCompanyData.phone_no) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  const updateQuery = `
    UPDATE company SET 
      company_name = '${updatedCompanyData.companyName || null}', 
      street = '${updatedCompanyData.street || null}',
      city = '${updatedCompanyData.city || null}' , 
      state =  '${updatedCompanyData.state || null}', 
      postal_code = '${updatedCompanyData.postalCode || null}', 
      phone_no =  '${updatedCompanyData.phoneNo || null}', 
      fax_no = '${updatedCompanyData.faxNo || null}', 
      currency = '${updatedCompanyData.currency || null}' 
    WHERE company.company_id=${companyId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating company:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Company Updated successfully");
    res.json({ success: true, companyId: results.insertId });
  });
});

// API to fetch company details by company ID
app.get("/company/:companyId", (req, res) => {
  const companyId = req.params.companyId;

  // Query the 'company' table by company ID
  const query = "SELECT * FROM company WHERE company_id = ?";

  connection.query(query, [companyId], (error, results) => {
    if (error) {
      console.error("Error fetching company details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const company = results;
    res.json({ company });
  });
});

//  Api to delete company
app.delete("/company/delete/:companyId", (req, res) => {
  const companyId = req.params.companyId;

  // Query to delete the company based on companyId
  const deleteQuery = "DELETE FROM company WHERE company_id = ?";

  connection.query(deleteQuery, [companyId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting company:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (company deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Company deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Company not found" });
    }
  });
});

// ######################################################################## LOCATION ########################################################
//    Location table APIs

// Add a new loaction with specific columns
app.post("/location/newLocation", (req, res) => {
  const locationData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!locationData || !locationData.location_id || !locationData.loaction_name || !locationData.phone_no) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new location into the 'location' table
  const insertQuery = `
    INSERT INTO location (location_name, street, city, state, postal_code, contact, phone_no, fax_no, parent_location)
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    locationData.locationName,
    locationData.street,
    locationData.city,
    locationData.stateOrCountry,
    locationData.postalCode || null,
    locationData.contact,
    locationData.phoneNo || null,
    locationData.faxNo || null,
    locationData.parentLocation,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting location:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Location inserted successfully");
    res.json({ success: true, locationId: results.insertId });
  });
});

//  Update the location details
app.put("/location/update/:locationId", (req, res) => {
  const updatedLocationData = req.body;
  const locationId = req.params.locationId;

  const updateQuery = `
    UPDATE location SET 
      location_name = '${updatedLocationData.locationName}', 
      street = '${updatedLocationData.street}', 
      city = '${updatedLocationData.city}', 
      state = '${updatedLocationData.stateOrCountry}', 
      postal_code = '${updatedLocationData.postalCode || null}', 
      contact = '${updatedLocationData.contact}', 
      phone_no = '${updatedLocationData.phoneNo || null}', 
      fax_no = '${updatedLocationData.faxNo}', 
      parent_location = '${updatedLocationData.parentLocation}'
    WHERE location.location_id=${locationId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating location:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Location Updated successfully");
    res.json({ success: true, locationId: results.insertId });
  });
});

// API to fetch location details by location ID
app.get("/location/:locationId", (req, res) => {
  const locationId = req.params.locationId;

  // Query the 'location' table by location ID
  const query = "SELECT * FROM location WHERE location_id = ?";

  connection.query(query, [locationId], (error, results) => {
    if (error) {
      console.error("Error fetching location details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const location = results;
    res.json({ location });
  });
});

//  Api to delete location
app.delete("/location/delete/:locationId", (req, res) => {
  const locationId = req.params.locationId;

  // Query to delete the location based on locationId
  const deleteQuery = "DELETE FROM location WHERE location_id = ?";

  connection.query(deleteQuery, [locationId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting location:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (location deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Location deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Location not found" });
    }
  });
});

// ######################################################################## DEPARTMENT ########################################################
//    Department table APIs

// Add a new department with specific columns
app.post("/department/newDepartment", (req, res) => {
  const departmentData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!departmentData || !departmentData.department_id || !departmentData.department_name || !departmentData.manager) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new department into the 'department' table
  const insertQuery = `
    INSERT INTO department ( department_name, description, manager, contact_no, active)
    VALUES ( ?, ?, ?, ?, ?)
  `;

  const values = [
    departmentData.departmentName || null,
    departmentData.description || null,
    departmentData.manager || null,
    departmentData.contactNo || null,
    departmentData.active || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting department:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Department inserted successfully");
    res.json({ success: true, locationId: results.insertId });
  });
});

//  Update the dpartment details
app.put("/department/update/:departmentId", (req, res) => {
  const updatedDepartmentData = req.body;
  const departmentId = req.params.departmentId;

  // if (!updatedDepartmentData || !updatedDepartmentData.department_id || !updatedDepartmentData.department_name || !updatedDepartmentData.manager) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  const updateQuery = `
    UPDATE department SET 
      department_name = '${updatedDepartmentData.departmentName}', 
      description = '${updatedDepartmentData.description}', 
      manager = '${updatedDepartmentData.manager}', 
      contact_no = '${updatedDepartmentData.contactNo}', 
      active = '${updatedDepartmentData.active || null}'
    WHERE department.department_id=${departmentId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating Department:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Department Updated successfully");
    res.json({ success: true, departmentId: results.insertId });
  });
});

// API to fetch department details by department ID
app.get("/department/:departmentId", (req, res) => {
  const departmentId = req.params.departmentId;

  // Query the 'department' table by department ID
  const query = "SELECT * FROM department WHERE department_id = ?";

  connection.query(query, [departmentId], (error, results) => {
    if (error) {
      console.error("Error fetching department details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    const department = results;
    res.json({ department });
  });
});

//  Api to delete department
app.delete("/department/delete/:departmentId", (req, res) => {
  const departmentId = req.params.departmentId;

  // Query to delete the department based on department id
  const deleteQuery = "DELETE FROM department WHERE department_id = ?";

  connection.query(deleteQuery, [departmentId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting department:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (department deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Department deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Department not found" });
    }
  });
});

// ######################################################################### CMDB ####################################################################
//    CMDB table APIs

// Add a new CMDB with specific columns
app.post("/cmdb/newRecord", (req, res) => {
  const recordData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!recordData || !recordData.item_name || !recordData.item_tag || !recordData.relationship_id) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new record into the 'cmdb' table
  const insertQuery = `
    INSERT INTO cmdb (item_name, item_tag, item_description, company, serial_number, model_number, operating_system, 
    os_domain, version, service_pack, storage, manufaturer, relationship_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.itemName || null,
    recordData.itemTag || null,
    recordData.itemDescription || null,
    recordData.company || null,
    recordData.serialNumber || null,
    recordData.modelNumber || null,
    recordData.operatingSystem || null,
    recordData.osDomain || null,
    recordData.version || null,
    recordData.servicePack || null,
    recordData.storage || null,
    recordData.manufacturer || null,
    recordData.relationshipId || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting record:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

//  Update the record details
app.put("/cmdb/update/:recordId", (req, res) => {
  const updatedRecordData = req.body;
  const recordId = req.params.recordId;

  // if (!updatedRecordData || !updatedRecordData.item_name || !updatedRecordData.item_tag || !updatedRecordData.relationship_id) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  const updateQuery = `
    UPDATE cmdb SET 
      item_name = '${updatedRecordData.itemName || null}', 
      item_tag = '${updatedRecordData.itemTag || null}', 
      item_description = '${updatedRecordData.itemDescription}', 
      company = '${updatedRecordData.company}', 
      serial_number = '${updatedRecordData.serialNumber}', 
      model_number = '${updatedRecordData.modelNumber || null}', 
      operting_system = '${updatedRecordData.operatingSystem || null}', 
      os_domain = '${updatedRecordData.osDomain || null}', 
      version = '${updatedRecordData.version || null}', 
      service_pack = '${updatedRecordData.servicePack || null}', 
      storage = '${updatedRecordData.storage || null}', 
      manufacturer = '${updatedRecordData.manufacturer}', 
      relationship_id = '${updatedRecordData.relationshipId}'
    WHERE cmdb.record_id=${recordId}
  `;
  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating record:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Record Updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// API to fetch record details by record ID
app.get("/cmdb/:recordId", (req, res) => {
  const recordId = req.params.recordId;

  const query = "SELECT * FROM cmdb WHERE recordId = ?";

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error fetching record details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = results[0];
    res.json({ record });
  });
});

//  Api to delete Record
app.delete("/cmdb/delete/:recordId", (req, res) => {
  const recordId = req.params.recordId;
  // Query to delete the record based on recordId
  const deleteQuery = "DELETE FROM cmdb WHERE record_id = ?";
  connection.query(deleteQuery, [recordId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting record:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ######################################################################### FLOWS ####################################################################
//    FLOWS table APIs

// Add a new flow record with specific columns
app.post("/flows/newFlow", (req, res) => {
  const recordData = req.body;

  // Validate the request data (you can add more validation as needed)
  // if (!recordData || !recordData.item_name || !recordData.item_tag || !recordData.relationship_id) {
  //   return res.status(400).json({ error: 'Invalid request data' });
  // }

  // Insert the new record into the 'flows' table
  const insertQuery = `
    INSERT INTO flows (flow_name, description, active, department, category, sub_category, service, 
    created_by,  trigger_name, created, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.flowName || null,
    recordData.description || null,
    recordData.active || null,
    recordData.department || null,
    recordData.category || null,
    recordData.subCategory || null,
    recordData.service || null,
    recordData.createdBy || null,
    recordData.triggerName || null,
    recordData.created || null,
    recordData.data || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting flow record:", error);
      return res.status(500).json({ error: "Flow Internal Server Error" });
    }

    console.log("Flow Record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

//  Update the flow record details
app.put("/flow/update/:flowId", (req, res) => {
  const updatedFlowRecordData = req.body;
  const recordId = req.params.flowId;

  const updateQuery = `
    UPDATE cmdb SET 
      flow_name = '${updatedFlowRecordData.flowName || null}', 
      description = '${updatedFlowRecordData.description || null}', 
      active = '${updatedFlowRecordData.active}', 
      department = '${updatedFlowRecordData.department}', 
      category = '${updatedFlowRecordData.category}', 
      subCategory = '${updatedFlowRecordData.subCategory || null}', 
      service = '${updatedFlowRecordData.service || null}', 
      createdBy = '${updatedFlowRecordData.createdBy || null}', 
      triggerName = '${updatedFlowRecordData.triggerName || null}', 
      created = '${updatedFlowRecordData.created || null}', 
    WHERE flows.id=${recordId}
  `;
  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating flow record:", error);
      return res.status(500).json({ error: "Flow Internal Server Error" });
    }

    console.log("Flow Record Updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// API to fetch record details by record ID
app.get("/flows/:flowId/", (req, res) => {
  const recordId = req.params.flowId;

  const query = "SELECT * FROM wonhubs.flows WHERE id = ?";

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.log("Error fetching flow record details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Flow Record not found" });
    }

    const record = results[0];
    console.log(results);
    res.json({ record });
  });
});

//  Api to delete Record
app.delete("/flows/delete/:flowId", (req, res) => {
  const recordId = req.params.flowId;
  // Query to delete the record based on flowId
  const deleteQuery = "DELETE FROM flows WHERE id = ?";
  connection.query(deleteQuery, [recordId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting flow record:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ######################################################################## Alerts #####################################################################
// Alerts table APIs

// Add a new alert record with specific columns
app.post("/alerts/newAlert", (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO alerts (title, type, short_description, active, created_by, created)
    VALUES (?, ?, ?, ? ,?, ?)
  `;
  const values = [
    recordData.title || null,
    recordData.type || null,
    recordData.shortDescription || null,
    recordData.active || null,
    recordData.createdBy || null,
    recordData.created || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.log("Error inserting alert record: ", error);
      return res.status(500).json({ error: "alerts Internal server Error" });
    }

    console.log(" alert record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// Update the alert record details
app.put("/alerts/update/:alertId", (req, res) => {
  const updateAlertRecordData = req.body;
  const recordId = req.params.alertId;

  const updateQuery = `
    UPDATE alerts SET
      title = '${updateAlertRecordData.title || null}',
      type = '${updateAlertRecordData.type || null}',
      short_description = '${updateAlertRecordData.shortDescription || null}',
      active = '${updateAlertRecordData.active || null}',
      created = '${updateAlertRecordData.created}'
    WHERE alerts.id = ${recordId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.log("Error Updating alert record:", error);
      return res.status(500).json({ error: "Alerts internal server error" });
    }

    console.log("Alerts record updated successfully");
    res.json({ successs: true, recordId: results.insertId });
  });
});

// to fetch record data by record Id
app.get("/alert/:alertId", (req, res) => {
  const recordId = req.params.flowId;

  const query = `SELECT * FROM alerts WHERE id = ?`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error fetching flow record details", error);
      return reseller
        .status(500)
        .json({ error: "Alerts Internal servor Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Flow Record not found" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// Api to delete Record
app.delete("/alerts/delete/:alertId", (req, res) => {
  const recordId = req.params.alertId;

  // query to delete specific record in alerts table
  const deleteQuery = ` DELETE FROM alerts WHERE id = ?`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("error deleting alert recordL:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // check if any rows affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### connections ############################################################################
// connections table APIs

// add new connection with specific columns
app.post("/connections/newConnection", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO connections (
    name, 
    type, 
    description, 
    end_point,
    authentication_type, 
    enabled, 
    created_at, 
    user, 
    status, 
    notes, 
    integration_type, 
    frequency, 
    connection_parameter, 
    who_can_access, 
    timeout, 
    cost, 
    version, 
    source, 
    created_by, 
    expiration_policy, 
    connection_secrete, 
    user_name, 
    password, 
    attachment, 
    source_path   
  )
    VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? )
  `;

  const values = [
    recordData.name,
    recordData.type,
    recordData.description,
    recordData.endPoint,
    recordData.authenticationType,
    recordData.enabled,
    recordData.createdAt,
    recordData.user,
    recordData.status,
    recordData.notes,
    recordData.integrationType,
    recordData.frequency,
    recordData.connectionParameter,
    recordData.whoCanAccess,
    recordData.timeout,
    recordData.cost,
    recordData.version,
    recordData.source,
    recordData.createdBy,
    recordData.expirationPolicy,
    recordData.connectionSecrete,
    recordData.userName,
    recordData.password,
    recordData.attachment,
    recordData.sourcePath,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting connection record:", error);
      return res
        .status(5000)
        .json({ error: "connections Internal server Error" });
    }

    console.log("connection record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the connection record details
app.put("/connections/update/:connectionId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.connectionId;

  const updateQuery = `UPDATE connections SET (
    name = '${recordData.name || null}', 
    type = '${recordData.type || null}', 
    description = '${recordData.description || null}', 
    end_point = '${recordData.point || null}',
    authentication_type = '${recordData.authenticationType || null}', 
    enabled = '${recordData.enabled || null}', 
    created_at = '${recordData.createdAt || null}', 
    user = '${recordData.user || null}', 
    status = '${recordData.status || null}', 
    notes = '${recordData.notes || null}', 
    integration_type = '${recordData.integrationType || null}', 
    frequency = '${recordData.frequency || null}', 
    connection_parameter = '${recordData.connectionParameter || null}', 
    who_can_access = '${recordData.whoCanAccess || null}', 
    timeout = '${recordData.timeout || null}', 
    cost = '${recordData.cost || null}', 
    version = '${recordData.version || null}', 
    source = '${recordData.source || null}', 
    created_by = '${recordData.createdBy || null}', 
    expiration_policy = '${recordData.expirationPolicy || null}', 
    connection_secrete = '${recordData.connectionSecret || null}', 
    user_name = '${recordData.userName || null}', 
    password = '${recordData.password || null}', 
    attachment = '${recordData.attachment || null}', 
    source_path  = '${recordData.sourcePath || null}'
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the connection record", error);
      return res
        .status(500)
        .json({ error: "connections inernal server error" });
    }

    console.log("connection updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get connection details by id
app.get("/connections/:connectionId", (req, res) => {
  const recordId = req.params.connectionId;

  const query = `SELECT * from connections WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "connections Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete connection by id
app.delete("/connections/delete/:connectionId", (req, res) => {
  const recordId = req.params.connectionId;

  const deleteQuery = ` DELETE FROM connections WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the connection record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ##########################################################################  core_transactions  #####################################################################
// core_transactions table APIs

// add new transaction with specific columns
app.post("/core-transaction/newTransaction", (req, res) => {
  const recordData = req.body;

  const insertQuery = `
    INSERT INTO core_transactions  (
      user_id, 
      first_name, 
      last_name, 
      title, 
      department, 
      email, 
      phone_number, 
      group_id, 
      group_name, 
      group_email, 
      parent_group, 
      group_type, 
      region, 
      company_id, 
      company_name, 
      role_id, 
      role_name,
      role_type,
      location_id,
      location_name,
      postal_code,
      department_id,
      manager,
      connection_id,
      connection_name,
      user, 
      created_by,
      created_date,
      source_name,
      target_name,
      contact_person
    )
    VALUES ( ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?, )

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
    recordData.createdDate || null,
    recordData.sourceName || null,
    recordData.targetName || null,
    recordData.contactPerson || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error adding new record in core_transactions: ", error);
      return res
        .status(500)
        .json({ error: "core_transactionsInternal server error" });
    }

    console.log("New Transaction added successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the transaction in the transaction table
app.put("/core-transactions/update/:transactionId", (req, res) => {
  const recordId = req.params.transactionId;
  const recordData = req.body;

  const updateQuery = `
    UPDATE core_transaction SET (
      user_id = ${recordData.userId || null}, 
      first_name = ${recordData.firstName || null}, 
      last_name = ${recordData.lastName || null}, 
      title = ${recordData.title || null}, 
      department = ${recordData.department || null}, 
      email = ${recordData.email || null}, 
      phone_number = ${recordData.phoneNumber || null}, 
      group_id = ${recordData.groupId || null}, 
      group_name = ${recordData.groupName || null}, 
      group_email = ${recordData.groupEmail || null}, 
      parent_group = ${recordData.parentGroup || null}, 
      group_type = ${recordData.groupType || null}, 
      region = ${recordData.region || null}, 
      company_id = ${recordData.companyId || null}, 
      company_name = ${recordData.compayName || null}, 
      role_id = ${recordData.roleId || null}, 
      role_name = ${recordData.roleName || null},
      role_type = ${recordData.roleType || null},
      location_id = ${recordData.locationId || null},
      location_name = ${recordData.locationName || null},
      postal_code = ${recordData.postalCode || null},
      department_id = ${recordData.departmentId || null},
      manager = ${recordData.manager || null},
      connection_id = ${recordData.connectionId || null},
      connection_name = ${recordData.connectionName || null},
      user = ${recordData.user || null}, 
      created_by = ${recordData.createdBy || null},
      created_date = ${recordData.createdDate || null},
      source_name = ${recordData.sourceName || null},
      target_name = ${recordData.targetName || null},
      contact_person = ${recordData.contactPerson || null}
    ) WHERE transaction_id = ${recordId}
  `;

  connection.query(updateQuery, [recordId], (error, results) => {
    if (error) {
      console.error("error updating core transaction;", error);
      return res
        .status(500)
        .json({ error: "error while updating the transaction" });
    }

    console.log("Transaction record updated succesfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get transaction record details by id
app.get("/core-transactions/:transactionId", (req, res) => {
  const recordId = req.params.transactionId;

  const query = `SELECT * FROM core_transactions transaction_id = ${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error(
        "Error fetching transaction record in core_transactions:",
        error
      );
      return res
        .status(500)
        .json({ error: "CORE_TRANSACTIONS internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete transaction record from core_transactions
app.delete("/core-transactions/delete/:transactionsId", (req, res) => {
  const recordId = req.params.transactionId;

  const deleteQuery = `DELETE FROM core_transactions WHERE transaction_id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, rersults) => {
    if (error) {
      console.error("Error deleting transaction record: ", error);
      return res
        .status(500)
        .json({ error: "core_transactions Internal server error" });
    }

    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

//  ####################################################################### CATALOGS ############################################################################

// add new desigh with specific columns to the catalog tabble
app.post("/designs/newCatalog", (req, res) => {
  const recordData = req.body;

  const insertQuery = `INSERT INTO catalogs (
    title,
    department,
    category,
    sub_category,
    fields,
    tabs,
    buttons,
    img_url,
    created_by,
    view,
    active
)
  VALUES ( ? , ? , ? , ? , ? , ? , ?, ? , ?, ?, ? )

`;
  const values = [
    recordData.title || null,
    recordData.department || null,
    recordData.category || null,
    recordData.sub_category || null,
    JSON.stringify(recordData.fields) || null,
    JSON.stringify(recordData.tabs) || null,
    JSON.stringify(recordData.buttons) || null,
    recordData.img_url || null,
    recordData.created_by || null,
    JSON.stringify(recordData.view) || null,
    recordData.active || true,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.log("Error Inserting catalog design record:", error);
      return res
        .status(5000)
        .json({ error: "catalog design internal server Error" });
    }

    console.log("catalog design inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get all distinct department names from the catalog table
app.get("/catalogDesigns/departments", (req, res) => {
  const selectQuery = `SELECT DISTINCT department FROM catalogs`;

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.log("Error fetching unique departments :", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    const departments = results.map((row) => row.department);
    res.json({ departments });
  });
});

// get all distinct catagory names from the catalog table of specified department in ''user portal''
app.get("/catalogDesigns/categories/:department", (req, res) => {
  const department = req.params.department;
  const selectQuery =
    "SELECT DISTINCT category FROM catalogs WHERE department = ?";

  connection.query(selectQuery, [department], (error, results) => {
    if (error) {
      console.log(
        "Error fetching unique categories of specific department:",
        error
      );
      return res.status(500).json({ error: "Internal server error" });
    }

    const categories = results.map((row) => row.category);
    res.json({ categories });
  });
});

// get all the sub-categories from the catelog table of specified category and department
app.get("/catalogDesigns/subCategories/:category/:department", (req, res) => {
  const department = req.params.department;
  const category = req.params.category;

  const selectQuery =
    "SELECT DISTINCT sub_category FROM catalogs where department = ? AND category = ?";

  connection.query(selectQuery, [department, category], (error, results) => {
    if (error) {
      console.log(
        "Error fetching unique subCategories of specific department and category:",
        error
      );
      return res.status(500).json({ error: "Internal server error" });
    }

    const subCategories = results.map((row) => row.sub_category);
    res.json({ subCategories });
  });
});

// get data of a catalog from the catelog table of specified sub_category of category and department in designer for catalogs
app.get("/catalogs/:subCategory/:category/:department", (req, res) => {
  const department = req.params.department;
  const category = req.params.category;
  const subCategory = req.params.subCategory;

  const selectQuery =
    "SELECT * from catalogs where department = ? AND category = ? AND sub_category = ?";

  connection.query(
    selectQuery,
    [department, category, subCategory],
    (error, results) => {
      if (error) {
        console.log(
          "Error fetching unique subCategories of specific department and category:",
          error
        );
        return res.status(500).json({ error: "Internal server error" });
      }

      const catalogsData = results;
      res.json({ catalogsData });
      console.log(catalogsData);
    }
  );
});

// get data of specified department, category and subcategory for the raiseTicket
app.get("/raiseTicket/:subCategory/:category/:department", (req, res) => {
  const department = req.params.department;
  const category = req.params.category;
  const subCategory = req.params.subCategory;

  const selectQuery =
    "SELECT DISTINCT fields from catalogs where department = ? AND category = ? AND sub_category = ?";

  connection.query(
    selectQuery,
    [department, category, subCategory],
    (error, results) => {
      if (error) {
        console.log(
          "Error fetching fields data of a specific subCategory of specific category of specific deparatment",
          error
        );
        return res.status(500).json({ error: "Internal server error" });
      }

      const fields = results.map((row) => row.fields);
      res.json({ fields });
      // console.log(fields)
    }
  );
});

//  ####################################################################### ADMIN PORTAL FORMS ############################################################################       20

// add new desigh with specific columns to the admin_portal_forms table
app.post("/designs/newAdminPortalForm", (req, res) => {
  const recordData = req.body;

  const insertQuery = `INSERT INTO admin_portal_forms (
    title,
    department,
    category,
    sub_category,
    fields,
    tabs,
    buttons,
    img_url,
    created_by,
    view,
    active,
    standard
)
  VALUES ( ? , ? , ? , ? , ? , ? , ?, ? , ?, ?, ?, ? )
`;
  const values = [
    recordData.title || null,
    recordData.department || null,
    recordData.category || null,
    recordData.sub_category || null,
    JSON.stringify(recordData.fields) || null,
    JSON.stringify(recordData.tabs) || null,
    JSON.stringify(recordData.buttons) || null,
    recordData.img_url || null,
    recordData.created_by || null,
    JSON.stringify(recordData.view) || null,
    recordData.active || true,
    recordData.standard || true,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.log("Error Inserting Admin poral form design record:", error);
      return res
        .status(5000)
        .json({ error: "Admin portal form design internal server Error" });
    }

    console.log("Admin portal form design inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get all distinct department names from the admin_portal_forms table
app.get("/AdminPortalForm/departments", (req, res) => {
  const selectQuery = `SELECT DISTINCT department FROM admin_portal_forms`;

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.log("Error fetching unique departments :", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    const departments = results.map((row) => row.department);
    res.json({ departments });
  });
});

// get all distinct catagory names from the catalog table of specified department in
app.get("/AdminPortalForm/categories/:department", (req, res) => {
  const department = req.params.department;
  const selectQuery =
    "SELECT DISTINCT category FROM admin_portal_forms WHERE department = ?";

  connection.query(selectQuery, [department], (error, results) => {
    if (error) {
      console.log(
        "Error fetching unique categories of specific department:",
        error
      );
      return res.status(500).json({ error: "Internal server error" });
    }

    const categories = results.map((row) => row.category);
    res.json({ categories });
  });
});

// get all the sub-categories from the admin_portal_forms table of specified category and department
app.get("/AdminPortalForm/subCategories/:category/:department", (req, res) => {
  const department = req.params.department;
  const category = req.params.category;

  const selectQuery =
    "SELECT DISTINCT sub_category FROM admin_portal_forms where department = ? AND category = ?";

  connection.query(selectQuery, [department, category], (error, results) => {
    if (error) {
      console.log(
        "Error fetching unique subCategories of specific department and category:",
        error
      );
      return res.status(500).json({ error: "Internal server error" });
    }

    const subCategories = results.map((row) => row.sub_category);
    res.json({ subCategories });
  });
});

// get data of a AdminPortalForm from the admin_portal_forms table of specified sub_category of category and department in designer for AdminPortalForm
// THIS API FETCHES THE ADMIN PORTAL FORMS DATA
app.get("/AdminPortalForms/:subCategory/:category/:department", (req, res) => {
  const department = req.params.department;
  const category = req.params.category;
  const subCategory = req.params.subCategory;
  const Standard = "true";

  const selectQuery =
    "SELECT * from admin_portal_forms where department = ? AND category = ? AND sub_category = ? AND standard = ?";

  connection.query(
    selectQuery,
    [department, category, subCategory, Standard],
    (error, results) => {
      if (error) {
        console.log(
          "Error fetching unique subCategories of specific department and category FOR ADMIN PORAL FORMS:",
          error
        );
        return res.status(500).json({ error: "Internal server error" });
      }

      const AdminFormsData = results;
      res.json({ AdminFormsData });
    }
  );
});

// ####################################################################### designs ############################################################################
// designs table APIs
// add new connection with specific columns
app.post("/designs/newDesign", async (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO designs (
    title, 
    description, 
    department,
    category, 
    sub_category, 
    product, 
    fields, 
    tabs, 
    buttons, 
    created_by, 
    updated_by, 
    no_of_fields, 
    created, 
    updated,
    org_id
  )
    VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?, ? )
  `;
  const { id } = decodeAccessToken(req.headers["authorization"]);
  const orgId = await getOrganizationIdWithUserId(id);
  // console.log('org_id: ', orgId)
  const values = [
    recordData.title || "Untitled",
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

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting design record:", error);
      return res.status(5000).json({ error: "designs Internal server Error" });
    }

    console.log("design record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the design record details
app.put("/designs/update/:designId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.designId;

  const updateQuery = `UPDATE designs SET (
    title = '${recordData.title || null}', 
    description = '${recordData.description || null}', 
    department = '${recordData.department || null}',
    category = '${recordData.category || null}', 
    sub_category = '${recordData.sub_category || null}', 
    product = '${recordData.product || null}', 
    fields = '${recordData.fields || null}', 
    tabs = '${recordData.tabs || null}', 
    buttons = '${recordData.buttons || null}', 
    created_by = '${recordData.createdBy || null}', 
    updated_by = '${recordData.updatedBy || null}', 
    no_of_fields = '${recordData.noOfFields || null}', 
    created = '${recordData.created || null}', 
    updated = '${recordData.updated || null}'
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the design record", error);
      return res.status(500).json({ error: "designs inernal server error" });
    }

    console.log("design updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get design details by id
app.get("/designs/:designId", (req, res) => {
  const recordId = req.params.designId;

  const query = `SELECT * from designs WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "designs Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete design by id
app.delete("/designs/delete/:designId", (req, res) => {
  const recordId = req.params.designId;

  const deleteQuery = ` DELETE FROM designs WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the design record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### feedBack ############################################################################
// feedBack table APIs
// add new feedback with specific columns
app.post("/feedback/newFeedback", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO feedBack (
    title, 
    short_description, 
    date_of_submission,
    template_image_name,
    template_image,
    sections,
    active, 
    responses, 
    created, 
    updated, 
    created_by, 
    updated_by
  )
    VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? )
  `;

  const values = [
    recordData.formTitle || null,
    recordData.shortDescription || null,
    recordData.dateOfSubmission || null,
    recordData.formTitle || null,
    recordData.image || null,
    JSON.stringify(recordData.sections) || null,
    recordData.active || null,
    JSON.stringify(recordData.responses) || null,
    recordData.created || null,
    recordData.updated || null,
    recordData.created_by || null,
    recordData.updated_by || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting feedback record:", error);
      return res.status(5000).json({ error: "feedBack Internal server Error" });
    }

    console.log("feedback record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the feedback record details
app.put("/feedback/update/:feedbackId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.feedbackId;

  const updateQuery = `UPDATE feedBack SET (
    title = '${recordData.title || null}', 
    short_description = '${recordData.shortDescription || null}', 
    date_of_submission = '${recordData.dateOfSubmission || null}',
    feedback_on = '${recordData.feedbackOn || null}', 
    active = '${recordData.active || null}', 
    prerview = '${recordData.preview || null}', 
    created = '${recordData.created || null}', 
    updated = '${recordData.updated || null}', 
    created_by = '${recordData.createdBy || null}', 
    updated_by = '${recordData.updatedBy || null}', 
  ) WHERE id = ${recordId}
  `;
  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the feedback record", error);
      return res.status(500).json({ error: "feedback inernal server error" });
    }

    console.log("feedback updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get feedback details by id
app.get("/feedback/:feedbackId", (req, res) => {
  const recordId = req.params.feedbackId;

  const query = `SELECT * from feedBack WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "feedBack Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete feedback by id
app.delete("/feedback/delete/:feedbackId", (req, res) => {
  const recordId = req.params.designId;

  const deleteQuery = ` DELETE FROM feedback WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the feedback record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### templates ############################################################################
// templates table APIs

// add new template with specific columns
app.post("/template/newTemplate", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO templates (
    name, 
    active, 
    type,
    style, 
    short_description, 
    who_will_recieve, 
    created_by, 
    sms_alert, 
    preview , 
    created,
    updated
  )
    VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? )
  `;

  const values = [
    recordData.name || null,
    recordData.active || null,
    recordData.type || null,
    recordData.style || null,
    recordData.shortDescription || null,
    recordData.whoWillRecieve || null,
    recordData.createdBy || null,
    recordData.smsAlerts || null,
    recordData.preview || null,
    recordData.created_by || null,
    recordData.updated || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting template record:", error);
      return res.status(5000).json({ error: "template Internal server Error" });
    }

    console.log("template record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the template record details
app.put("/template/update/:templateId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.templateId;

  const updateQuery = `UPDATE feedBack SET (
    name = ${recordData.name || null} , 
    active = ${recordData.active || null} , 
    type = ${recordData.type || null} ,
    style = ${recordData.style || null} , 
    short_description = ${recordData.shortDescription || null} , 
    who_will_recieve = ${recordData.whoWillRecieve || null} , 
    created_by = ${recordData.createdBy || null} , 
    sms_alert = ${recordData.smsAlert || null} , 
    preview = ${recordData.preview || null}  , 
    created = ${recordData.created || null} ,
    updated = ${recordData.updated || null} 
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the template record", error);
      return res.status(500).json({ error: "templates inernal server error" });
    }

    console.log("template updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get template details by id
app.get("/template/:templateId", (req, res) => {
  const recordId = req.params.templateId;

  const query = `SELECT * from templates WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "templates Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete template by id
app.delete("/template/delete/:templateId", (req, res) => {
  const recordId = req.params.templateId;

  const deleteQuery = ` DELETE FROM templates WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the template record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### ci_transitions ############################################################################
// ci_transition table APIs

// add new transition with specific columns
app.post("/ci_transitions/newTransition", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO ci_trancitions (
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
    VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?)
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

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting transition record:", error);
      return res
        .status(5000)
        .json({ error: "transition Internal server Error" });
    }

    console.log("transition record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the transition record details
app.put("/ci_transitions/update/:transitionId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.transitionId;

  const updateQuery = `UPDATE ci_transitions SET (  
    item_name = ${recordData.itemName || null} , 
    item_tag = ${recordData.itemTag || null} , 
    item_description = ${recordData.itemDescription || null} ,
    company = ${recordData.company || null} , 
    serial_number = ${recordData.serialNumber || null} , 
    model_number = ${recordData.modelNumber || null} , 
    version = ${recordData.version || null} , 
    storage = ${recordData.storage || null} , 
    operating_system = ${recordData.operatingSystem || null}  , 
    os_domain = ${recordData.osDomain || null} ,
    service_pack = ${recordData.servicePack || null} ,    
    manufacturer = ${recordData.manufacturer || null} ,
    relationship_id = ${recordData.relationshipId || null} 
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the transition record", error);
      return res
        .status(500)
        .json({ error: "ci_transitions inernal server error" });
    }

    console.log("transition updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get transition details by id
app.get("/ci_transitions/:transitionId", (req, res) => {
  const recordId = req.params.transitionId;

  const query = `SELECT * from ci_transitions WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "templates Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete transition by id
app.delete("/ci_transitions/delete/:transitionId", (req, res) => {
  const recordId = req.params.transitionId;

  const deleteQuery = ` DELETE FROM ci_transitions WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the transition record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### document_manager ############################################################################
// document_manager table APIs
// add new document with specific columns
app.post("/domunents/newDocument", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO document_manager (
    document_type, 
    document_size, 
    document_name,
    who_can_access, 
    created_by, 
    last_modified, 
    created_date, 
    description,
  )
    VALUES ( ? , ? , ? , ? , ? , ? , ? , ? )
  `;

  const values = [
    recordData.documentType || null,
    recordData.documentSize || null,
    recordData.documentName || null,
    recordData.whoCanAccess || null,
    recordData.createdBy || null,
    recordData.lastModified || null,
    recordData.createdDate || null,
    recordData.description || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting document record:", error);
      return res
        .status(5000)
        .json({ error: "document_manager Internal server Error" });
    }

    console.log("document record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the document record details
app.put("/documents/update/:documentId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.documentId;

  const updateQuery = `UPDATE document_manager SET ( 
    document_type = ${recordData.documentType || null} , 
    document_size = ${recordData.documentSize || null} , 
    document_name = ${recordData.documentName || null} ,
    who_can_access = ${recordData.whoCanAccess || null} , 
    created_by = ${recordData.createdBy || null} , 
    last_modified = ${recordData.lastModified || null} , 
    created_date = ${recordData.createdDate || null} , 
    description = ${recordData.description || null} ,
    
  ) WHERE document_id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the document record", error);
      return res
        .status(500)
        .json({ error: "document_manager inernal server error" });
    }

    console.log("document updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get transition details by id
app.get("/documents/:documentId", (req, res) => {
  const recordId = req.params.documentId;

  const query = `SELECT * from document_manager WHERE document_id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res
        .status(5000)
        .json({ error: "document_manager Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete transition by id
app.delete("/documents/delete/:documentId", (req, res) => {
  const recordId = req.params.documentId;

  const deleteQuery = ` DELETE FROM document_manager WHERE document_id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the document record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### notifications ############################################################################
// notifications table APIs

// add new notification with specific columns
app.post("/notifications/newNotifications", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO notifications (
    name, 
    active, 
    to_address,
    cc, 
    type, 
    description, 
    subject, 
    email_body,
    created_by,
    who_will_recieve,
    bulk_notification,
    sms_alert,
    preview,
    created,
    updated,
    updated_by
  )
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, )
  `;

  const values = [
    recordData.name || null,
    recordData.active || null,
    recordData.toAddress || null,
    recordData.cc || null,
    recordData.type || null,
    recordData.description || null,
    recordData.subject || null,
    recordData.emailBody || null,
    recordData.createdBy || null,
    recordData.whoWillRecieve || null,
    recordData.bulkNotification || null,
    recordData.smsAlert || null,
    recordData.preview || null,
    recordData.created || null,
    recordData.updated || null,
    recordData.updatedBy || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting notification record:", error);
      return res
        .status(5000)
        .json({ error: "notifications Internal server Error" });
    }

    console.log("notification record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the notification record details
app.put("/notifications/update/:notificationId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.notificationId;

  const updateQuery = `UPDATE notifications SET (     
    name = ${recordData.documentType || null} , 
    active = ${recordData.documentSize || null} , 
    to_address = ${recordData.documentName || null} ,
    cc = ${recordData.whoCanAccess || null} , 
    type = ${recordData.createdBy || null} , 
    description = ${recordData.lastModified || null} , 
    subject = ${recordData.createdDate || null} , 
    email_body = ${recordData.description || null} ,
    created_by = ${recordData.documentType || null} , 
    who_will_recieve = ${recordData.documentSize || null} , 
    bulk_notification = ${recordData.documentName || null} ,
    sms_alert = ${recordData.whoCanAccess || null} , 
    preview = ${recordData.createdBy || null} , 
    created = ${recordData.lastModified || null} , 
    updated = ${recordData.createdDate || null} , 
    updated_by = ${recordData.description || null} ,
    
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the notification record", error);
      return res
        .status(500)
        .json({ error: "notifications inernal server error" });
    }

    console.log("notification updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get notification details by id
app.get("/notification/:notificationId", (req, res) => {
  const recordId = req.params.notificationId;

  const query = `SELECT * from notifications WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(500).json({ error: "notifications Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete notification by id
app.delete("/notifications/delete/:notificationId", (req, res) => {
  const recordId = req.params.notificationId;

  const deleteQuery = ` DELETE FROM notifications WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the notification record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### service_mapping ############################################################################
// service_mapping table APIs

// add new serviceMapping with specific columns
app.post("/service-mapping/newServiceMap", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO service_mapping (
    department, 
    category, 
    sub_category,
    service, 
    manager, 
    created_by, 
    last_modified, 
    status,
    short_description,
    active,
  )
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, )
  `;

  const values = [
    recordData.department || null,
    recordData.category || null,
    recordData.sub_category || null,
    recordData.service || null,
    recordData.manager || null,
    recordData.created_by || null,
    recordData.last_modified || null,
    recordData.status || null,
    recordData.short_description || null,
    recordData.active || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting serviceMapping record:", error);
      return res
        .status(5000)
        .json({ error: "service_mapping Internal server Error" });
    }

    console.log("service_mapping record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the serviceMapping record details
app.put("/service-mapping/update/:serviceId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.serviceId;

  const updateQuery = `UPDATE service_mapping SET ( 
    
    department = ${recordData.department || null} , 
    category = ${recordData.category || null} , 
    sub_category = ${recordData.subCategory || null} ,
    service = ${recordData.service || null} , 
    manager = ${recordData.manager || null} , 
    created_by = ${recordData.createdBy || null} , 
    last_modified = ${recordData.lastModified || null} , 
    status = ${recordData.status || null} ,
    short_description = ${recordData.shortDescription || null} , 
    active = ${recordData.active || null} , 
    
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the serviceMapping record", error);
      return res
        .status(500)
        .json({ error: "service_mapping inernal server error" });
    }

    console.log("serviceMapping updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get servicemaing details by id
app.get("/service-mapping/:serviceId", (req, res) => {
  const recordId = req.params.serviceId;

  const query = `SELECT * from service_mapping WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "notifications Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete serviceMapping by id
app.delete("/service-mapping/delete/:serviceId", (req, res) => {
  const recordId = req.params.serviceId;

  const deleteQuery = ` DELETE FROM service_mapping WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the serviceMapping record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ####################################################################### SLA ############################################################################
// sla table APIs
// add new sla record with specific columns
app.post("/sla/newRecord", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO sla (
    sla_name, 
    start_date, 
    target_date,
    end_date, 
    duration, 
    remaining_duration, 
    created_by, 
    last_modified,
    sla_description,
    time_format
  )
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, )
  `;

  const values = [
    recordData.slaName || null,
    recordData.startDate || null,
    recordData.targetDate || null,
    recordData.endDate || null,
    recordData.duration || null,
    recordData.remainingDuration || null,
    recordData.createdBy || null,
    recordData.lastModified || null,
    recordData.slaDescription || null,
    recordData.timeFormat || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting new record:", error);
      return res.status(5000).json({ error: "sla Internal server Error" });
    }

    console.log("sla record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the sla record details
app.put("/sla/update/:slaId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.slaId;

  const updateQuery = `UPDATE sla SET ( 
    
    sla_name = ${recordData.slaName || null} , 
    start_date = ${recordData.startDate || null} , 
    target_date = ${recordData.targetDate || null} ,
    end_date = ${recordData.endDate || null} , 
    duration = ${recordData.duration || null} , 
    remaining_duration = ${recordData.remainingDuration || null} , 
    created_by = ${recordData.createdBy || null} , 
    last_modified = ${recordData.lastModified || null} ,
    sla_description = ${recordData.slaDescription || null} , 
    time_format = ${recordData.timeFormat || null} , 
    
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the sla record", error);
      return res.status(500).json({ error: "sla inernal server error" });
    }

    console.log("sla record updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get sla details by id
app.get("/sla/:slaId", (req, res) => {
  const recordId = req.params.slaId;

  const query = `SELECT * from sla WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "sla Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete sla by id
app.delete("/sla/delete/:slaId", (req, res) => {
  const recordId = req.params.serviceId;

  const deleteQuery = ` DELETE FROM sla WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the sla record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // check if any rows are affected (record deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

// ######################################################################### TASKS ######################################################
//    Tasks table APIs
// Add a new task with specific columns
app.post("/tasks/newTask", (req, res) => {
  const taskData = req.body;

  // Insert the new ticket into the 'ticket' table
  const insertQuery = `
    INSERT INTO tasks (
    name,
    on_behalf_of,
    status,
    approval_state, 
    short_description, 
    description,
    private_comments,
    public_comments, 
    active, 
    history, 
    priority, 
    requested_email, 
    department,
    state, 
    assigned_member, 
    approved_by, 
    requested_by,
    task_type,
    attachments,
    price_per_unit, 
    quantity
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,)
`;
  const values = [
    taskData.name || null,
    taskData.on_behalf_of || null,
    taskData.status || null,
    taskData.approval_state || null,
    taskData.short_description || null,
    taskData.description || null,
    taskData.private_comments || null,
    taskData.public_comments || null,
    taskData.active || null,
    taskData.history || null,
    taskData.priority || null,
    taskData.requested_email || null,
    taskData.department || null,
    taskData.state || null,
    taskData.assigned_member || null,
    taskData.approved_by || null,
    taskData.requested_by || null,
    taskData.task_type || null,
    taskData.attachments || null,
    taskData.price_per_unit || null,
    taskData.quantity || null,

    // ticketData.ticketNo || null,
    // ticketData.status || null,
    ticketData.shortDescription || null,
    // ticketData.description || null,
    ticketData.requestedEmail || null,
    ticketData.active || null,
    // ticketData.category || null,
    // ticketData.state || null,
    ticketData.taskType || null,
    ticketData.attachment || null,
    // ticketData.category || null,
    // ticketData.name || null,
    // ticketData.service || null,
    ticketData.subCategory || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Task inserted successfully");
    res.json({ success: true, taskId: results.insertId });
  });
});

//  Update the task details
app.put("/tasks/update/:taskId", (req, res) => {
  const updatedTaskData = req.body;
  const taskId = req.params.taskId;

  // ticket_id = ${updatedTicketData.ticket_id || null},

  const updateQuery = `
    UPDATE tasks SET 
      service = '${updatedTaskData.service || null}', 
      status = '${updatedTaskData.status || null}', 
      approval_state = '${updatedTaskData.approval_state}', 
      short_description = '${updatedTaskData.short_description || null}', 
      description = '${updatedTaskData.description || null}',
      private_comments = '${updatedTaskData.private_comments || null}', 
      public_comments = '${updatedTaskData.public_comments || null}', 
      active = '${updatedTaskData.active}', 
      history = '${updatedTaskData.history || null}'
    WHERE tasks.id=${taskId}
  `;

  connection.query(updateQuery, (error, results) => {
    if (error) {
      console.error("Error Updating task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Task Updated successfully");
    res.json({ success: true, taskId: taskId });
  });
});

// API to fetch task details by task ID
app.get("/tasks/:taskId", (req, res) => {
  const taskId = req.params.taskId;

  // Query the 'tasks' table by task ID
  const query = "SELECT * FROM tasks WHERE id = ?";

  connection.query(query, [taskId], (error, results) => {
    if (error) {
      console.error("Error fetching task details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = results[0];
    res.json({ task });
  });
});

//  Api to delete task
app.delete("/tasks/delete/:taskId", (req, res) => {
  const taskId = req.params.taskId;

  // Query to delete the task based on task ID
  const deleteQuery = "DELETE FROM tasks WHERE id = ?";
  connection.query(deleteQuery, [taskId], (error, results) => {
    // Handle response
    if (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were affected (task deleted successfully)
    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Task deleted successfully" });
    } else {
      return res.status(404).json({ error: "Task not found" });
    }
  });
});

// ####################################################################### approvals ############################################################################
// approval table APIs
// add new approval record with specific columns
app.post("/approvals/newRecord", (req, res) => {
  const recordData = req.body;

  const insertQuery = ` INSERT INTO approvals (
    state ,
    approved_by , 
    requested_by , 
    approved_date , 
    created_date ,
    approved_notes , 
    short_description ,
    description , 
    active , 
    name ,
    approval_group , 
    location ,
    due_date
  )
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
  `;

  const values = [
    recordData.state || null,
    recordData.approvedBy || null,
    recordData.requestedBy || null,
    recordData.approvedDate || null,
    recordData.createdDate || null,
    recordData.approvedNotes || null,
    recordData.shortDescription || null,
    recordData.description || null,
    recordData.active || null,
    recordData.name || null,
    recordData.approvalGroup || null,
    recordData.location || null,
    recordData.dueDate || null,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error Inserting new record:", error);
      return res
        .status(5000)
        .json({ error: "approvals Internal server Error" });
    }

    console.log("approvals record inserted successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// update the approvals record details
app.put("/approvals/update/:approvalId", (req, res) => {
  const recordData = req.body;
  const recordId = req.params.approvalId;

  const updateQuery = `UPDATE approvals SET (     
    state = ${recordData.state || null} , 
    approved_by = ${recordData.approvedBy || null} , 
    requested_by = ${recordData.requestedBy || null} ,
    approved_date = ${recordData.approvedDate || null} , 
    created_date = ${recordData.createdDate || null} , 
    approved_notes = ${recordData.approvedNotes || null} , 
    short_description = ${recordData.shortDescription || null} , 
    description = ${recordData.description || null} ,
    active = ${recordData.active || null} , 
    name = ${recordData.name || null} , 
    approval_group = ${recordData.approvalGroup || null} , 
    location = ${recordData.location || null} , 
    due_date = ${recordData.dueDate || null} , 
    
  ) WHERE id = ${recordId}
  `;

  connection.query(updateQuery, recordId, (error, results) => {
    if (error) {
      console.log("Error while updating the approvals record", error);
      return res.status(500).json({ error: "approvals inernal server error" });
    }

    console.log("approvals record updated successfully");
    res.json({ success: true, recordId: results.insertId });
  });
});

// get approval details by id
app.get("/approvals/:approvalId", (req, res) => {
  const recordId = req.params.slaId;

  const query = `SELECT * from approvals WHERE id=${recordId}`;

  connection.query(query, [recordId], (error, results) => {
    if (error) {
      console.error("Error Fetching record details: ", error);
      res.status(5000).json({ error: "approvals Internal server error" });
    }

    const record = results[0];
    res.json({ record });
  });
});

// delete approval by id
app.delete("/approvals/delete/:approvalId", (req, res) => {
  const recordId = req.params.approvalId;

  const deleteQuery = ` DELETE FROM approvals WHERE id = ${recordId}`;

  connection.query(deleteQuery, [recordId], (error, results) => {
    if (error) {
      console.error("Error deleting the approval record:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(404).json({ error: "Record not found" });
    }
  });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const serverOptions = {
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/api.wonhubs.com/fullchain.pem"
    ),
    key: fs.readFileSync("/etc/letsencrypt/live/api.wonhubs.com/privkey.pem"),
  };
  server = https.createServer(serverOptions, app);
} else {
  server = require("http").createServer(app);
}

const wss = new WebSocket.Server({ server });

// const connectedClients = new Set();

wss.on("connection", (socket) => {
  console.log("WebSocket client connected");
  addClient(socket);

  const checkHealth = () => {
    pool.getConnection((err, connection) => {
      const status = {
        server: true,
        database: !err,
      };
      if (connection) connection.release();
      try {
        socket.send(JSON.stringify({ type: "status", data: status }));
      } catch (e) {
        console.error("Failed to send message:", e.message);
      }
    });
  };

  const interval = setInterval(checkHealth, 5000);

  socket.on("close", () => {
    clearInterval(interval);
    removeClient(socket);
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});

// function getConnectedClients() {
//   return connectedClients || new Set();
// }

// /// Function to start the server and Gmail watch process
async function startServer() {
  const wsdlXML = await fs.readFile(wsdlPath, "utf8");
  // const authClient = await authorize();
  console.log("starting server...");

  // Start the Express server
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB connected");
      soap.listen(server, "/wsdl", userService, wsdlXML);
      server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(
          `SOAP server running on http://localhost:${PORT}/wsdl?wsdl`
        );
        // startWatch(authClient); // Start watching Gmail when the server is ready
      });
    })
    .catch((err) => console.error("❌ MongoDB connection failed:", err));
}

// // Start the server
startServer();
