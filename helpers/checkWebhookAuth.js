
const { db } = require('../config/DB-connection')
const { getUserIdWithApiKey } = require('./findUserId')

const authenticateApiCredentials = async (req, res, next) => {
  const { api_key, api_token } = req.query;

  if (!api_key || !api_token) {
    return res.status(400).json({ error: 'Missing API key or token' });
  }

  try {
    const userId = await getUserIdWithApiKey(api_key)
    const [rows] = await db.execute(
      `
      SELECT 
        1 
      FROM 
        api_keys 
      WHERE 
        api_key = ? 
      AND 
        secret_token = ? 
      AND 
        userId = ? 
      AND 
        status = 'active' 
      LIMIT 1`,
      [api_key, api_token, userId]
    );

    if (rows.length === 0) {
      throw new Error('Invalid API credentials or inactive key');
    }
    console.log('Authenticating the Webhook successful.');

    req.userId = userId; // Optionally pass userId to controller
    next();
  } catch (err) {
    console.error('Webhook Authentication failed:', err.message);
    res.status(500).json({ error: 'Internal server error during webhook authentication' });
    throw err; // Let the caller handle the failure
  }
};

module.exports = {
  authenticateApiCredentials
};