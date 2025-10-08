const { db } = require("../../config/DB-connection");
const decodeToken = require('../../utils/auth/DecodeAccessToken')
const { getOrganizationIdWithUserId } = require('../../helpers/findOrgId')
const defaultDepartments = require('../../shared/data/defaultdepartments')


const getOrganizationDepartments = async (req, res) => {
  try {
    const { id } = decodeToken(req.headers['authorization'])
    const orgId = await getOrganizationIdWithUserId(id)
    const query = `SELECT * FROM department WHERE org_id = ?`
    const [departments] = await db.execute(query, [orgId])

    const finalDepartments = [
      ...defaultDepartments,
      ...departments
    ]

    res.status(200).json({ success: true, data: finalDepartments })
  } catch (err) {
    console.log('error getting the organizationdepartments', err)
    res.status(500).json({ success: false, message: err })
  }
}

module.exports = {
  getOrganizationDepartments
}