
const { db } = require('../config/DB-connection')

const getUserIdWithApiKey = async (apiKey) => {
  try {
    const [result] = await db.execute(
      `SELECT userId FROM api_keys WHERE api_key = ?`,
      [apiKey])
    if (result.length === 0)
      throw new Error('User not found')
    // console.log("found user with api_key: ", result[0]);
    
    return result[0].userId
  } catch (err) {
    console.log('error finding user with api_key: ', err);
  }
}

const getOrganizationIdWithApiKey = async (apiKey) => {
  try {
    const userId = await getUserIdWithApiKey(apiKey);
    const [result] = await db.execute(
      `SELECT organization_id FROM users WHERE id = ?`,
      [userId]
    );
    if (result.length === 0) throw new Error("Organization not found");
    // console.log("found user with api_key: ", result[0]);

    return result[0].organization_id;
  } catch (err) {
    console.log("error finding user with api_key: ", err);
  }
};

module.exports = {
  getUserIdWithApiKey,
  getOrganizationIdWithApiKey,
}