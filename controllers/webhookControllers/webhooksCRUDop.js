// require('dotenv').config();
const { db } = require("../../config/DB-connection");
const {
  getOrganizationIdWithUserId,
} = require("../../helpers/findOrgId");
const jwt = require('jsonwebtoken');

const getOrgWebhooks = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    const accessToken = authHeader.split(' ')[1]

    // Decode the accessToken to get the userId
    const decoded = jwt.decode(accessToken);
    const userId = decoded && decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const query = `SELECT * FROM webhooks WHERE org_id = ? AND status = 'active'`;
    const [orgWebhooks] = await db.execute(query, [orgId]);
    const formatedList = orgWebhooks.map(webhook => ({
      id: webhook.id,
      name: webhook.webhook_name,
    }))
    // console.log(formatedList);
    res.status(200).json({ sucess: true, data: formatedList });
  } catch (err) {
    console.error('Error in getOrgWebhooks', err)
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getOrgWebhooks
}