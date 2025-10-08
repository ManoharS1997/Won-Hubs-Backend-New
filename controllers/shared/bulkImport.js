const { db, pool } = require('../../config/DB-connection')

// this is for Importing bulk data into tables
const bulkImport = async (req, res) => {
    console.log("bulkImport");

    upload.single("file"), async (req, res) => {

        try {
            if (!req.file) return res.status(400).json({ message: "No file uploaded!" });
            console.log("File upload!", req.file);

            const { tableName } = req.body;
            if (!tableName) return res.status(400).json({ message: "Table name is required!" });

            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (data.length === 0) {
                await fs.unlink(filePath).catch(() => { });
                return res.status(400).json({ message: "Uploaded file is empty!" });
            }

            let insertedRecords = 0;
            let errors = [];

            const dbConnection = await pool.promise().getConnection();
            await dbConnection.beginTransaction();

            const columns = Object.keys(data[0]);
            const placeholders = columns.map(() => "?").join(", ");
            const updateColumns = columns.map(col => `${col} = VALUES(${col})`).join(", ");

            for (const row of data) {
                try {
                    const values = columns.map(col => row[col] || null);
                    const query = `
            INSERT INTO ${tableName} (${columns.join(", ")}) 
            VALUES (${placeholders}) 
            ON DUPLICATE KEY UPDATE ${updateColumns}
          `;
                    const [result] = await dbConnection.query(query, values);
                    if (result.affectedRows > 0) insertedRecords++;
                } catch (error) {
                    errors.push({ row, error: error.message });
                }
            }

            await dbConnection.commit();
            dbConnection.release();
            res.json({ message: "File processed successfully", insertedRecords, errors });
        } catch (err) {
            console.log("Error processing file", err);


            res.status(500).json({ message: "Error processing file", error: err.message });
        } finally {
            await fs.unlink(filePath).catch(() => { });
        }
    }
}

// this is for Downloading the template of the table
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