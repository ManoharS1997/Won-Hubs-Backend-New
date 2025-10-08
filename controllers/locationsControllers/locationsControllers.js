
const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const jwt = require("jsonwebtoken");

const getOrgLocations = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"].split(" ")[1]
    // require("jsonwebtoken");
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const query = "SELECT * FROM location WHERE org_id = ? AND active = '1'";
    const values = [orgId];

    const [result] = await db.execute(query, values);
    // console.log('Decoded user ID:', result);

    if (result.length === 0) {
      return res.status(404).json({ message: "No locations found for this organization." });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching organization locations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}


module.exports = {
  getOrgLocations,
};