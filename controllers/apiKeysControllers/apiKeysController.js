const crypto = require('crypto');
const { db } = require("../../config/DB-connection");


// Utility to generate a secure random token
function generateToken(prefix = 'api_', length = 32) {
  return prefix + crypto.randomBytes(length).toString('hex');
}

const createApiKey = async (req, res) => {
  try {
    const { name, userId, description } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'Missing required fields: name, userId' });
    }

    const apiKey = generateToken('key_', 16);
    const secretToken = generateToken('sec_', 32);
    const status = 'active';
    // const createdAt = new Date();

    const [result] = await db.execute(
      `INSERT INTO api_keys (name, api_key, description, secret_token, userId, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(6))`,
      [name, apiKey, description, secretToken, userId, status]
    );

    return res.status(201).json({
      message: 'API key created successfully',
      apiKey: apiKey,
      secretToken: secretToken, // Show only once!
      id: result.insertId
    });

  } catch (err) {
    console.error('Error creating API key:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getApiKeys = async (req, res) => { // GET /api/apiKeys
  try {
    const [result] = await db.execute('SELECT id, api_key, name, secret_token, description, status FROM api_keys');
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching API keys:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getActiveApiKeys = async (req, res) => { // GET /api/apiKeys/active
  try {
    const [result] = await db.execute('SELECT id, api_key, name FROM api_keys WHERE status = ?', ['active']);
    return res.status(200).json(result);
  }
  catch (err) {
    console.error('Error fetching active API keys:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteApiKey = async (req, res) => { // DELETE /api/apiKeys/:id
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' });
    }
    const [result] = await db.execute('DELETE FROM api_keys WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }
    return res.status(200).json({ message: 'API key deleted successfully' });
  } catch (err) {
    console.error('Error deleting API key:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createApiKey,
  getApiKeys,
  deleteApiKey,
  getActiveApiKeys
};
//sec_92e67980f140ace573bb9fcdb58a3c50128e9fc9ea996f15e52c0ff1d539bd05
// key_7b5a6f36a79b80bac3ceca5eec5c2aab