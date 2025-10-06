
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


// const AddLocation = async (req, res) => {
//   try {
//     const locationData = req.body;
//     console.log(locationData, "body heree");

//     // 🔑 Decode JWT
//     const accessToken = req.headers["authorization"].split(" ")[1];
//     const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//     console.log(decoded, "decoded");

//     const userId = decoded.id;
//     const orgId = await getOrganizationIdWithUserId(userId);
//     console.log("orgId", orgId);
//     console.log("location Data ", locationData);

//     // ✅ Insert query
//     const insertQuery = `
//       INSERT INTO location
//       (location_name, street, city, state, postal_code, phone_no, contact, fax_no, parent_location, org_id)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [
//       locationData.location_name,
//       locationData.street,
//       locationData.city,
//       locationData.state,
//       locationData.postal_code,
//       locationData.phone_no,
//       locationData.contact,
//       locationData.fax_no,
//       locationData.parent_location,
//       orgId
//     ];

//     // ✅ promise-based query
//     const [results] = await db.query(insertQuery, values);

//     console.log("Location inserted successfully", results);
//     res.json({ success: true, locationId: results.insertId });

//   } catch (err) {
//     console.error("Error in AddLocation:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// 🟢 Add new location
const AddLocation = async (req, res) => {
  try {
    const locationData = req.body;

    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const insertQuery = `
      INSERT INTO location 
      (location_name, street, city, state, postal_code, contact, phone_no, fax_no, parent_location, org_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      locationData.location_name,
      locationData.street || null,
      locationData.city || null,
      locationData["state/country"] || null,
      locationData.postal_code || null,
      locationData.contact || null,
      locationData.phone_no || null,
      locationData.fax_no || null,
      locationData.parent_location || null,
      orgId || null
    ];

    const [results] = await db.query(insertQuery, values);

    res.json({ success: true, locationId: results.insertId });
  } catch (error) {
    console.error("Error inserting location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟡 Update location
const updateLocation = async (req, res) => {
  try {
    const locationId = req.params.locationId;
    const updatedLocationData = req.body;

    const updateQuery = `
      UPDATE location SET 
        location_name = ?, 
        street = ?, 
        city = ?, 
        state = ?, 
        postal_code = ?, 
        contact = ?, 
        phone_no = ?, 
        fax_no = ?, 
        parent_location = ?
      WHERE location_id = ?
    `;

    const values = [
      updatedLocationData.locationName || null,
      updatedLocationData.street || null,
      updatedLocationData.city || null,
      updatedLocationData.stateOrCountry || null,
      updatedLocationData.postalCode || null,
      updatedLocationData.contact || null,
      updatedLocationData.phoneNo || null,
      updatedLocationData.faxNo || null,
      updatedLocationData.parentLocation || null,
      locationId
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json({ success: true, message: "Location updated successfully" });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟢 Get location by ID
const getLocationById = async (req, res) => {
  try {
    const locationId = req.params.locationId;

    const [results] = await db.query("SELECT * FROM location WHERE location_id = ?", [locationId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json({ location: results[0] });
  } catch (error) {
    console.error("Error fetching location details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔴 Delete location
const deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.locationId;
    const [results] = await db.query("DELETE FROM location WHERE location_id = ?", [locationId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Location deleted successfully" });
    } else {
      return res.status(404).json({ error: "Location not found" });
    }
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = {
  getOrgLocations,
  AddLocation,
    updateLocation,
  getLocationById,
  deleteLocation
};