
const { db } = require('../config/DB-connection')

const getOrganizationIdWithUserId = async (userId) => {
  try {
    const [result] = await db.execute(
      `SELECT organization_id FROM users WHERE id = ?`,
      [userId])
    if (result.length === 0)
      throw new Error('Organization Id not found')
    return result[0].organization_id
  } catch (err) {
    console.log('error finding organization id with userId: ', err);
  }
}

module.exports = {
  getOrganizationIdWithUserId
}