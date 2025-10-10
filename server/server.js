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
const { spawn } = require("child_process");

const { execSync } = require("child_process");

const authenticateToken = require("../utils/auth/authorization");

const decodeAccessToken = require("../utils/auth/DecodeAccessToken.js");
const { getOrganizationIdWithUserId } = require("../helpers/findOrgId.js");

// Import Routes
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
const companyRoutes = require("../routes/companyRoutes/companyRoutes.js");
const ticketRoutes = require("../routes/ticketRoutes/TicketsRoutes.js");
const { getReportdata } = require("../controllers/shared/reportControllers.js");
const RoleRoutes = require("../routes/rolesRoutes/rolesRoutes.js");
const AlertRoutes = require("../routes/alertRoutes/AlertRoute.js");
const TicketRoutes = require("../routes/ticketRoutes/TicketsRoutes.js");
const UserRoutes = require("../routes/users/userRoutes.js");
const CompanyRoutes = require("../routes/companyRoutes/companyRoutes.js");
const FlowRoutes = require("../routes/flowRoutes/flowroutes.js");
const ConnectionsRoutes = require("../routes/connectionsRoutes/connectionsRoute.js");
const CoreTransactionRoutes = require("../routes/Core-TransactionRoutes/Core-TransactionRoutes.js");
const AdminPlatformroutes = require("../routes/AdminPortalFormRoutes/AdminPortalFormRoutes.js");
const DesignRoutes = require("../routes/DesignRoutes/DesignRoutes.js");
const FeedbackRoutes = require("../routes/FeedbackRoutes/FeedbackRoutes.js");
const TemplateRoutes = require("../routes/Templates Routes/templateRoutes.js");
const CITransitionRoutes = require("../routes/CITransitionRoutes/CITransitionRoutes.js");
const documentRoutes = require("../routes/DocumentRoutes/DocumentRoutes.js");
const NotificationRoutes = require("../routes/NotificationRoutes/NotificationRoutes.js");
const ServiceMappingRoutes = require("../routes/Service-MappingRoutes/Service-MappingRoutes.js");
const SLARoutes = require("../routes/slaRoutes/slaRoutes.js");
const TaskRoutes = require("../routes/TaskRoutes/tasksRoutes.js");
const ApprovalRoutes = require("../routes/ApprovalRoutes/ApprovalRoutes.js");
const FormDesignerRoutes = require("../routes/formDesigner/formDesignerRoutes.js");
const ApiListRoutes = require("../routes/formDesigner/apiListRoutes.js");
// const LocationRoutes=require('../routes/locations/locationsRoutes.js')

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
// app.use("/api", sharedRoutes);
app.use("/api/zendesk/connections", zendeskConnectionRoutes);
app.use("/api/zapier/connections", zapierConnectionRoutes);
app.use("/api/slack/connections", slackConnectionRoutes);
app.use("/api/trello/connections", trelloConnectionRoutes);
app.use("/api/connections/soap", testSoapRoutes);
app.use("/api/admin/login", loginRoutes);
app.use("/api/admin/token", tokenRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/api-keys", apiKeysRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/cmdb", cmdbRoutes);
app.use("/api/cmdb-rel", relationsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/department", authenticateToken, departmentsRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/partners", partnerRoutes);
app.use("/api", sharedRoutes);
// Created Routes And Controllers
app.use("/tickets", ticketRoutes);
app.use("/roles", RoleRoutes);
app.use("/alerts", AlertRoutes);
app.use("/notifications", NotificationRoutes);
app.use("/ticket", TicketRoutes);
app.use("/flows", FlowRoutes);
app.use("/connections", ConnectionsRoutes);
app.use("/core-transactions", CoreTransactionRoutes);
app.use("AdminPortalForm", AdminPlatformroutes);
app.use("/designs", DesignRoutes); // check here we had
app.use("/feedback", FeedbackRoutes);
app.use("/templates", TemplateRoutes);
app.use("/ci_transitions", CITransitionRoutes);
app.use("/documents", documentRoutes);
app.use("/service-mapping", ServiceMappingRoutes);
app.use("/sla", SLARoutes);
app.use("/tasks", TaskRoutes);
app.use("/approvals", ApprovalRoutes);
app.use("/users", UserRoutes);
app.use("/company", CompanyRoutes);
app.use("/groups", groupRoutes);
app.use("/locations", locationsRoutes);
app.use("/departments", departmentsRoutes);
app.use("/api/form-designer", FormDesignerRoutes);
app.use("/form-designer", ApiListRoutes);
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});
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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> EMIT ALERT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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

//functions to get ai suggestions to the text

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
      return res
        .status(500)
        .json({
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
    return res
      .status(200)
      .json({
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

const stripHtml = (str) => {
  if (!str) return null;
  return str.replace(/<[^>]*>/g, "").trim();
};
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
        console.log(`SOAP server running on http://localhost:${PORT}/wsdl?wsdl`);
        // startWatch(authClient); // Start watching Gmail when the server is ready
      });
    })
    .catch((err) => console.error("❌ MongoDB connection failed:", err));
}

// // Start the server
startServer();
