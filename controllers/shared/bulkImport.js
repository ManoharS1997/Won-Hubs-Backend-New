const multer = require("multer");
// const decodeAccessToken = require("../../utils/auth/DecodeAccessToken");
const decodeAccessToken = require("../../utils/auth/DecodeAccessToken");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for example
});
// this is for Importing bulk data into tables
// its by kartheek commented by me 
// const bulkImport = async (req, res) => {
//     console.log("bulkImport");

//     upload.single("file"), async (req, res) => {

//         try {
//             if (!req.file) return res.status(400).json({ message: "No file uploaded!" });
//             console.log("File upload!", req.file);

//             const { tableName } = req.body;
//             if (!tableName) return res.status(400).json({ message: "Table name is required!" });

//             const filePath = req.file.path;
//             const workbook = xlsx.readFile(filePath);
//             const sheetName = workbook.SheetNames[0];
//             const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//             if (data.length === 0) {
//                 await fs.unlink(filePath).catch(() => { });
//                 return res.status(400).json({ message: "Uploaded file is empty!" });
//             }

//             let insertedRecords = 0;
//             let errors = [];

//             const dbConnection = await pool.promise().getConnection();
//             await dbConnection.beginTransaction();

//             const columns = Object.keys(data[0]);
//             const placeholders = columns.map(() => "?").join(", ");
//             const updateColumns = columns.map(col => `${col} = VALUES(${col})`).join(", ");

//             for (const row of data) {
//                 try {
//                     const values = columns.map(col => row[col] || null);
//                     const query = `
//             INSERT INTO ${tableName} (${columns.join(", ")}) 
//             VALUES (${placeholders}) 
//             ON DUPLICATE KEY UPDATE ${updateColumns}
//           `;
//                     const [result] = await dbConnection.query(query, values);
//                     if (result.affectedRows > 0) insertedRecords++;
//                 } catch (error) {
//                     errors.push({ row, error: error.message });
//                 }
//             }

//             await dbConnection.commit();
//             dbConnection.release();
//             res.json({ message: "File processed successfully", insertedRecords, errors });
//         } catch (err) {
//             console.log("Error processing file", err);


//             res.status(500).json({ message: "Error processing file", error: err.message });
//         } finally {
//             await fs.unlink(filePath).catch(() => { });
//         }
//     }
// }

const xlsx = require("xlsx");
const fs = require("fs/promises");
const { pool } = require("../../config/DB-connection");

// ✅ Utility: Convert "First Name" → "first_name"
const toSnakeCase = (str) =>
  str
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\w_]/g, "") // Remove special characters
    .toLowerCase();

const bulkImport = async (req, res) => {
  console.log("===== BULK IMPORT DEBUG =====");
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  let filePath;

  const tokenHeader = req.headers["authorization"];
  if (!tokenHeader) {
    return res.status(401).json({ message: "Access token is required!" });
  }

  const { id } = decodeAccessToken(tokenHeader);
  const orgId = await getOrganizationIdWithUserId(id);
  if (!orgId) {
    return res.status(403).json({ message: "Invalid organization or user." });
  }

  try {
    if (!req.file) {
      console.error("No file received!");
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const { tableName } = req.body;
    if (!tableName) {
      return res.status(400).json({ message: "Table name is required!" });
    }

    filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rawData.length === 0) {
      await fs.unlink(filePath).catch(() => { });
      return res.status(400).json({ message: "Uploaded file is empty!" });
    }

    // ✅ Add orgId to each row
    const transformedData = rawData.map((row) => {
      const newRow = {};
      for (const key in row) {
        newRow[toSnakeCase(key)] = row[key];
      }
      if (tableName === 'users') {
        newRow.organization_id = orgId;

      } else {
        newRow.org_id = orgId;
        if (tableName === 'group_names') {
          newRow.user_id = id;
        }
      }
      return newRow;
    });

    // console.log("Transformed Data:", transformedData);
    const dbConnection = await pool.promise().getConnection();
    await dbConnection.beginTransaction();

    const rawColumns = Object.keys(transformedData[0]);
    const columns = rawColumns.map((c) => `\`${c}\``);
    const placeholders = rawColumns.map(() => "?").join(", ");
    const updateColumns = rawColumns
      .map((col) => `\`${col}\`=VALUES(\`${col}\`)`)
      .join(", ");

    let insertedRecords = 0;
    let errors = [];

    for (const row of transformedData) {
      try {
        const values = rawColumns.map((col) => row[col] ?? null);

        const query = `
          INSERT INTO \`${tableName}\` (${columns.join(", ")})
          VALUES (${placeholders})
          ON DUPLICATE KEY UPDATE ${updateColumns}
        `;

        const [result] = await dbConnection.query(query, values);
        if (result.affectedRows > 0) insertedRecords++;
      } catch (error) {
        console.error("Row Insert Error:", error.message);
        errors.push({ row, error: error.message });
      }
    }

    await dbConnection.commit();
    dbConnection.release();

    res.status(200).json({
      success: true,
      message: "File processed successfully",
      insertedRecords,
      errors,
    });
  } catch (err) {
    console.error("Error processing file:", err);
    res
      .status(500)
      .json({ message: "Error processing file", error: err.message });
  } finally {
    if (filePath) await fs.unlink(filePath).catch(() => { });
  }
};


const downloadTemplate = async (req, res) => {
  console.log('downloading table template...')
  const { tableName } = req.params;

  if (!tableName) {
    return res.status(400).json({ message: "Table name is required!" });
  }

  try {
    const connection = await pool.promise().getConnection();

    // Query to get table schema
    const [columns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?;
      `, [process.env.DB_DATABASE, tableName]);

    connection.release();

    // Fields to exclude
    const excludedKeywords = ['id', 'password', 'secret', 'key', 'token', 'credential'];
    const filteredColumns = columns
      .filter(col =>
        !excludedKeywords.some(keyword => col.COLUMN_NAME.toLowerCase().includes(keyword)) &&
        col.DATA_TYPE !== 'json' &&
        col.COLUMN_KEY !== 'PRI' &&
        col.COLUMN_KEY !== 'MUL' // MUL indicates a foreign key in some MySQL versions
      )
      .map(col => ({ name: col.COLUMN_NAME, dataType: col.DATA_TYPE }));

    res.json({ tableName, fields: filteredColumns });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving fields", error: error.message });
  }
}


module.exports = {
  bulkImport,
  downloadTemplate,
}