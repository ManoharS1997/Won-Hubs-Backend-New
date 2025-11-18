const mongoose = require("mongoose");
const FormDesigner = require("../../model/mongoDb");
const { db } = require("../../config/DB-connection");

const saveFormData = async (req, res) => {
  try {
    const { moduleId, moduleName, formData } = req.body;

    if (!moduleId || !formData) {
      return res.status(400).json({
        success: false,
        message: "moduleId and formData are required",
      });
    }

    const sql = `
      INSERT INTO form_submissions (module_id, module_name, form_data)
      VALUES (?, ?, ?)
    `;

    await db.query(sql, [moduleId, moduleName, JSON.stringify(formData)]);

    res
      .status(201)
      .json({ success: true, message: "Record saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to save record" });
  }
};

const assignApi = async (req, res) => {
  try {
    const { moduleName, tabLabel, apiId } = req.body;

    if (!moduleName || !tabLabel || !apiId) {
      return res.status(400).json({
        success: false,
        message: "moduleName, tabLabel, and apiId are required.",
      });
    }

    const module = await FormDesigner.findOne({ moduleName });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: `Module '${moduleName}' not found.`,
      });
    }

    // Find the tab by label and update its API mapping
    const tabIndex = module.tabs.findIndex((tab) => tab.label === tabLabel);

    if (tabIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Tab '${tabLabel}' not found in ${moduleName}.`,
      });
    }

    module.tabs[
      tabIndex
    ].apiEndpoint = `/api/${moduleName}/${tabLabel.toLowerCase()}`;
    module.tabs[tabIndex].apiMethod = (await FormApi.findById(apiId)).method;
    module.tabs[tabIndex].actionType = "API Call";

    await module.save();

    return res.json({
      success: true,
      message: `API assigned to tab '${tabLabel}' successfully.`,
      data: module.tabs[tabIndex],
    });
  } catch (err) {
    console.error("Error assigning API to tab:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const handleError = (res, error, defaultStatus = 500) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: error.message,
      details: error.errors,
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: "CastError",
      message: "Invalid ID format",
      details: error.message,
    });
  }

  return res.status(defaultStatus).json({
    success: false,
    error: error.name || "ServerError",
    message: error.message || "Something went wrong",
  });
};

const createModule = async (req, res) => {
  try {
    const module = new FormDesigner(req.body);
    await module.save();
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    handleError(res, error, 400);
  }
};

const getModules = async (_req, res) => {
  try {
    const modules = await FormDesigner.find().sort({ _id: -1 });
    res.json({ success: true, data: modules });
  } catch (error) {
    handleError(res, error);
  }
};

const getModuleById = async (req, res) => {
  try {
    const module = await FormDesigner.findById(req.params.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Module not found",
      });
    }
    res.json({ success: true, data: module });
  } catch (error) {
    handleError(res, error);
  }
};

const getModuleByFields = async (req, res) => {
  // console.log("Triggering in getModuleByFields")
  try {
    const { category, subcategory, view, department, module } = req.body;
    console.log(category, subcategory, view, department, module, "Hereee");

    if (!category || !subcategory || !view || !department) {
      return res.status(400).json({
        success: false,
        error: "BadRequest",
        message:
          "All fields (category, subcategory, view, department) are required.",
      });
    }

    const moduleData = await FormDesigner.findOne({
      module,
      "selectedDepartments.department": department,
      category,
      "selectedDepartments.sub_category": subcategory,
      selectedViews: { $in: [view] },
    });

    if (!moduleData) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "No module found for the given filters.",
      });
    }

    return res.status(200).json({
      success: true,
      data: moduleData,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const updateModule = async (req, res) => {
  try {
    const module = await FormDesigner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!module) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Module not found",
      });
    }
    res.json({ success: true, data: module });
  } catch (error) {
    handleError(res, error, 400);
  }
};

const deleteModule = async (req, res) => {
  try {
    const module = await FormDesigner.findByIdAndDelete(req.params.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Module not found",
      });
    }
    res.json({ success: true, message: "Module deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

const alterModule = async (req, res) => {
  const data = req.body || {};

  try {
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No payload data provided",
      });
    }

    // 🔹 activeTable = SQL table name
    let tableName = data.activeTable;
    if (!tableName) {
      return res.status(400).json({
        success: false,
        message: "activeTable is required",
      });
    }

    
    tableName = tableName.replace(/[^a-zA-Z0-9_]/g, "_");
    
    console.log(tableName);
    // Validate table name
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activeTable name",
      });
    }

    // -------------------------
    // 1️⃣ Normalize activeUserData
    // -------------------------
    let userMeta = {};
    if (data.activeUserData) {
      try {
        userMeta = JSON.parse(data.activeUserData);
      } catch {
        userMeta = {};
      }
    }

    const userId = userMeta?.id || null;

    // -------------------------
    // 2️⃣ System fields
    // -------------------------
    const systemFields = {
      activeTable: tableName,
      tabName: data.tabName || null,
      activeNav: data.activeNav || null,
      userId,
    };

    const incomingData = { ...data, ...systemFields };

    // -------------------------
    // 3️⃣ Helpers
    // -------------------------
    const getSqlType = (value) => {
      if (value === null || value === undefined) return "VARCHAR(255)";
      if (typeof value === "object") return "LONGTEXT";
      const str = String(value);
      return str.length > 255 ? "LONGTEXT" : "VARCHAR(255)";
    };

    const normalizeValue = (value) => {
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    };

    // -------------------------
    // 4️⃣ Ensure table exists
    // -------------------------
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`${tableName}\` (
        record_id INT AUTO_INCREMENT PRIMARY KEY
      )
    `);

    // -------------------------
    // 5️⃣ Get existing columns
    // -------------------------
    const [existingCols] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const existingColNames = existingCols.map((col) => col.Field);

    // -------------------------
    // 6️⃣ Add missing columns
    // -------------------------
    const incomingFields = Object.keys(incomingData);

    const missingCols = incomingFields.filter(
      (f) => !existingColNames.includes(f)
    );

    for (const field of missingCols) {
      try {
        const sqlType = getSqlType(incomingData[field]);
        await db.query(
          `ALTER TABLE \`${tableName}\` ADD COLUMN \`${field}\` ${sqlType}`
        );
        console.log(`🟢 Added column '${field}' as ${sqlType}`);
      } catch (err) {
        if (err.code !== "ER_DUP_FIELDNAME") console.error(err);
      }
    }

    // -------------------------
    // 7️⃣ Prepare valid data
    // -------------------------
    const validData = Object.keys(incomingData).reduce((acc, key) => {
      acc[key] = normalizeValue(incomingData[key]);
      return acc;
    }, {});

    const columns = Object.keys(validData);
    const values = Object.values(validData);

    // -------------------------
    // 8️⃣ Composite lookup
    // -------------------------
    const filters = [
      ["userId", userId],
      ["activeTable", tableName],
      ["tabName", incomingData.tabName],
      ["activeNav", incomingData.activeNav],
    ];

    const whereSql = filters
      .filter(([_, val]) => val !== null)
      .map(([field]) => `\`${field}\` = ?`)
      .join(" AND ");

    const whereValues = filters
      .filter(([_, val]) => val !== null)
      .map(([_, val]) => val);

    // -------------------------
    // 9️⃣ Check if record exists
    // -------------------------
    const [existingRecord] = await db.query(
      `SELECT record_id FROM \`${tableName}\` WHERE ${whereSql} LIMIT 1`,
      whereValues
    );

    // -------------------------
    // 🔁 UPDATE
    // -------------------------
    if (existingRecord.length > 0) {
      const updateSql = columns.map((c) => `\`${c}\` = ?`).join(", ");
      await db.query(
        `UPDATE \`${tableName}\` SET ${updateSql} WHERE ${whereSql}`,
        [...values, ...whereValues]
      );

      return res.json({
        success: true,
        message: "Record updated successfully",
      });
    }

    // -------------------------
    // ➕ INSERT
    // -------------------------
    const placeholders = columns.map(() => "?").join(", ");

    await db.query(
      `INSERT INTO \`${tableName}\` (${columns.join(
        ","
      )}) VALUES (${placeholders})`,
      values
    );

    return res.json({
      success: true,
      message: "Record created successfully",
    });
  } catch (error) {
    console.error("❌ Error in alterModule:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getDynamicModuleData = async (req, res) => {
  console.log("Fetching dynamic data...");

  let { activeTable, tabName, activeNav, userId } = req.query;

  try {
    if (!activeTable || !tabName || !activeNav) {
      return res.status(400).json({
        success: false,
        message: "activeTable, tabName and activeNav are required",
      });
    }

    activeTable = activeTable.replace(/[^a-zA-Z0-9_]/g, "_");

    // Validate table name
    if (!/^[a-zA-Z0-9_]+$/.test(activeTable)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activeTable name",
      });
    }

    // WHERE config
    let where = ` WHERE activeTable = ? AND tabName = ? AND activeNav = ? `;
    let params = [activeTable, tabName, activeNav];

    if (userId) {
      where += ` AND userId = ? `;
      params.push(userId);
    }

    // QUERY
    const [rows] = await db.query(
      `SELECT * FROM \`${activeTable}\` ${where}`,
      params
    );

    // Parse JSON-like fields
    const cleanedRows = rows.map((row) => {
      if (row.activeUserData) {
        try {
          row.activeUserData = JSON.parse(row.activeUserData);
        } catch {}
      }
      return row;
    });

    return res.json({
      success: true,
      count: cleanedRows.length,
      data: cleanedRows,
    });
  } catch (error) {
    console.error("❌ Error in getDynamicModuleData:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleByFields,
  saveFormData,
  assignApi,
  alterModule,
  getDynamicModuleData,
};
