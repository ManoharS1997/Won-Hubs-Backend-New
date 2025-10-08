require('dotenv').config();
const { db } = require("../../config/DB-connection");
const axios = require("axios");
const { getConnectedClients } = require("../../socket/WebSocket.js");

setTimeout(() => {
  //const clients = getConnectedClients();
  //console.log(wss);
}, 1000);

let connectedClients = getConnectedClients()

const testAnyWebhook = async (req, res) => {
  const {
    url,
    method = "POST",
    headers = {},
    payload = {},
    contentType = "application/json",
    timeout = 5000,
    authType,         // 'basic', 'bearer', 'apiKey' or undefined
    username,
    password,
    token,
    apiKeyHeader,
    apiKeyValue,
  } = req.body;

  // Setup headers
  const finalHeaders = { ...headers };

  // Content-Type
  finalHeaders["Content-Type"] = contentType;

  // Authentication
  if (authType === "basic" && username && password) {
    finalHeaders["Authorization"] = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  } else if (authType === "bearer" && token) {
    finalHeaders["Authorization"] = "Bearer " + token;
  } else if (authType === "apiKey" && apiKeyHeader && apiKeyValue) {
    finalHeaders[apiKeyHeader] = apiKeyValue;
  }

  // Request body https://discord.com/api/webhooks/1364841938410405898/teAzOJHEMb4dW8DxocS8mtbtEtQQ2tSF9OW5fPXO_yRZTb3s_VYWPxHnhjJEb2ZToiVc
  let dataToSend;
  if (contentType === "application/json") {
    dataToSend = payload;
  } else if (contentType === "application/x-www-form-urlencoded") {
    const params = new URLSearchParams();
    for (let key in payload) {
      params.append(key, payload[key]);
    }
    dataToSend = params;
  } else {
    dataToSend = payload;
  }

  try {
    const response = await axios({
      url,
      method,
      headers: finalHeaders,
      data: dataToSend,
      timeout,
      validateStatus: () => true, // Prevent axios from throwing on non-2xx
    });

    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseData: response.data,
      headers: response.headers,
      time: response.elapsedTime || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.response?.data || null,
    });
  }
}

const verifyWebhook = async (req, res) => {
  // console.log("connected clients:", connectedClients);

  const challenge = req.body; // Look into query params!

  const message = JSON.stringify({
    type: 'webhook',
    data: { apiId: req.query.api_key, requestBody: challenge }
  });
  // Send to all connected WebSocket clients
  connectedClients?.forEach(socket => {
    if (socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  });
  // console.log('Responding to verification challenge:', challenge);
  return res.status(200).send({ success: true, data: JSON.parse(message) }); // Some services want plain text
};

const getWebhooks = async (req, res) => { // GET /api/apiKeys
  try {
    const [result] = await db.execute('SELECT id, webhook_url, webhook_name, scopes, status, description FROM webhooks');
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching Webhooks:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getWebhookById = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('SELECT id, webhook_url, webhook_name, scopes, status, description FROM webhooks WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    return res.status(200).json(result[0]);
  } catch (err) {
    console.error('Error fetching Webhook:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const addWebhook = async (req, res) => {
  // POST /api/apiKeys/create
  const { apiKeyId, name, permissions, description, url, userId } = req.body;
  try {
    // Fetch the api_key and secret_token from the api_keys table
    const [apiKeyResult] = await db.execute(
      "SELECT api_key, secret_token FROM api_keys WHERE id = ?",
      [apiKeyId]
    );

    const [userOrg] = await db.execute(
      "SELECT organization_id FROM users WHERE id = ?",
      [userId]
    );

    if (apiKeyResult.length === 0) {
      return res.status(404).json({ error: "API Key not found" });
    }

    const { api_key, secret_token } = apiKeyResult[0];
    console.log("api_key", api_key, "secret_token", secret_token);

    // Construct the webhook URL with the api_key and secret_token as query parameters
    const webhook_url = `${url}?api_key=${encodeURIComponent(api_key)}&api_token=${encodeURIComponent(secret_token)}`;
    const webhook_name = name;
    const scopes = permissions;
    const status = "active";
    const [result] = await db.execute(
      "INSERT INTO webhooks (webhook_url, webhook_name, scopes, status, description, userId, api_key, connection_secret, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [webhook_url, webhook_name, scopes, status, description, userId, api_key, secret_token, userOrg]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error adding Webhook:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteWebhook = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute("DELETE FROM webhooks WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    return res.status(204).send('Webhook deleted successfully');
  } catch (err) {
    console.error("Error deleting Webhook:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTickets = async (req, res) => {
  const { api_key, api_token } = req.query;

  if (!api_key || !api_token) {
    return res.status(400).json({ error: "Missing api_key or api_token in query parameters" });
  }

  try {
    // Verify the api_key and api_token
    const [apiKeyResult] = await db.execute(
      "SELECT id FROM api_keys WHERE api_key = ? AND secret_token = ?",
      [api_key, api_token]
    );

    if (apiKeyResult.length === 0) {
      return res.status(403).json({ error: "Invalid api_key or api_token" });
    }

    // Fetch tickets data
    const [tickets] = await db.execute("SELECT * FROM ticket LIMIT 10 OFFSET 0"); // Adjust the query as needed
    return res.status(200).json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  testAnyWebhook,
  verifyWebhook,
  getWebhooks,
  addWebhook,
  deleteWebhook,
  getWebhookById,
  getTickets
};