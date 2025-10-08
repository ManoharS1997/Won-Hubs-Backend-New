
const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const jwt = require("jsonwebtoken");


// const AddCompany = async (req, res) => {
//   try {
//     const companyData = req.body;
//     console.log(companyData, "body heree");

//     const accessToken = req.headers["authorization"].split(" ")[1];
//     const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//     console.log(decoded, "decoded");

//     const userId = decoded.id;
//     const orgId = await getOrganizationIdWithUserId(userId);
//     console.log("orgId", orgId);
//     console.log("company Data ", companyData);

//     const insertQuery = `
//       INSERT INTO company
//       (company_name, street, city, state, postal_code, phone_no, fax_no, currency, org_id)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [
//       companyData.company_name,
//       companyData.street,
//       companyData.city,
//       companyData.state,
//       companyData.postal_code,
//       companyData.phone,
//       companyData.fax_no,
//       companyData.currency,
//       orgId
//     ];

//     // ✅ use promise-based query
//     const [results] = await db.query(insertQuery, values);

//     console.log("company inserted successfully", results);
//     res.json({ success: true, companyId: results.insertId });

//   } catch (err) {
//     console.error("Error in AddCompany:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
// const { db } = require("../../config/DB-connection");
// const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
// const jwt = require("jsonwebtoken");

// 🟢 Add new company
const AddCompany = async (req, res) => {
  try {
    const companyData = req.body;

    const accessToken = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);

    const insertQuery = `
      INSERT INTO company  
        (company_name, street, city, state, postal_code, phone_no, fax_no, currency, org_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      companyData.company_name || null,
      companyData.street || null,
      companyData.city || null,
      companyData.state || null,
      companyData.postal_code || null,
      companyData.phone_no || null,
      companyData.fax_no || null,
      companyData.currency || null,
      orgId
    ];

    const [results] = await db.query(insertQuery, values);
    res.json({ success: true, companyId: results.insertId });
  } catch (error) {
    console.error("Error inserting company:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟡 Update company
const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const updatedCompanyData = req.body;

    const updateQuery = `
      UPDATE company SET 
        company_name = ?, 
        street = ?, 
        city = ?, 
        state = ?, 
        postal_code = ?, 
        phone_no = ?, 
        fax_no = ?, 
        currency = ?
      WHERE company_id = ?
    `;

    const values = [
      updatedCompanyData.companyName || null,
      updatedCompanyData.street || null,
      updatedCompanyData.city || null,
      updatedCompanyData.state || null,
      updatedCompanyData.postalCode || null,
      updatedCompanyData.phoneNo || null,
      updatedCompanyData.faxNo || null,
      updatedCompanyData.currency || null,
      companyId
    ];

    const [results] = await db.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ success: true, message: "Company updated successfully" });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🟢 Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.companyId;

    const [results] = await db.query("SELECT * FROM company WHERE company_id = ?", [companyId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ company: results[0] });
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔴 Delete company
const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const [results] = await db.query("DELETE FROM company WHERE company_id = ?", [companyId]);

    if (results.affectedRows > 0) {
      return res.json({ success: true, message: "Company deleted successfully" });
    } else {
      return res.status(404).json({ error: "Company not found" });
    }
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  AddCompany,
  updateCompany,
  getCompanyById,
  deleteCompany
};



