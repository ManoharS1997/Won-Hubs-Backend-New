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
    console.log("Error in createModule:", error);
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

const alterModule = async (req, res, next) => {
  try {
    console.log(req)
    const data = req.body || {};
    const files = req.files || {};

    console.log("Incoming BODY:", data);
    console.log("Incoming FILES:", files);

    if (!data.activeTable || !data.tabName || !data.activeNav) {
      return res.status(400).json({
        success: false,
        message: "activeTable, tabName & activeNav are required",
      });
    }

    if (!data.userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const userId = data.userId;

    let tableName = `${data.activeTable}__${data.tabName}__${data.activeNav}`
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .toLowerCase();

    const payload = { ...data };

    delete payload.activeTable;
    delete payload.tabName;
    delete payload.activeNav;
    delete payload.activeUserData;
    delete payload.userId;

    Object.keys(files).forEach((field) => {
      const f = files[field][0];
      payload[field] = {
        originalName: f.originalname,
        mimeType: f.mimetype,
        fileName: f.filename,
        path: f.path,
      };
    });

    const normalize = (v) => (typeof v === "object" ? JSON.stringify(v) : v);

    const getType = (v) => {
      if (typeof v === "object") return "LONGTEXT";
      if (String(v).length > 255) return "LONGTEXT";
      return "VARCHAR(255)";
    };

    let baseSchema = `
      record_id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `;

    Object.keys(payload).forEach((key) => {
      baseSchema += `, \`${key}\` ${getType(payload[key])}`;
    });

    await db.query(
      `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${baseSchema})`
    );

    const [existingCols] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const existing = existingCols.map((col) => col.Field);

    for (const key of Object.keys(payload)) {
      if (!existing.includes(key)) {
        await db.query(
          `ALTER TABLE \`${tableName}\` ADD COLUMN \`${key}\` ${getType(
            payload[key]
          )}`
        );
      }
    }

    if (!data.record_id) {
      const cols = ["userId", ...Object.keys(payload)];
      const values = [userId, ...Object.values(payload).map(normalize)];
      const qMarks = cols.map(() => "?").join(",");

      await db.query(
        `INSERT INTO \`${tableName}\` (${cols.join(",")}) VALUES (${qMarks})`,
        values
      );

      return res.json({ success: true, message: "Record created" });
    }

    const updateSQL = Object.keys(payload)
      .map((key) => `\`${key}\`=?`)
      .join(",");

    await db.query(
      `UPDATE \`${tableName}\` SET ${updateSQL} WHERE record_id=? AND userId=?`,
      [...Object.values(payload).map(normalize), data.record_id, userId]
    );

    return res.json({ success: true, message: "Record updated" });
  } catch (err) {
    console.error("❌ alterModule Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getDynamicModuleData = async (req, res) => {
  try {
    let { activeTable, tabName, activeNav, userId } = req.query;

    if (!activeTable || !tabName || !activeNav) {
      return res.status(400).json({
        success: false,
        message: "activeTable, tabName, activeNav are required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const tableName = `${activeTable}__${tabName}__${activeNav}`
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .toLowerCase();

    const [rows] = await db.query(
      `SELECT * FROM \`${tableName}\` WHERE userId = ? ORDER BY record_id DESC LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    const cleaned = {};
    const record = rows[0];

    for (const key in record) {
      try {
        cleaned[key] = JSON.parse(record[key]);
      } catch {
        cleaned[key] = record[key];
      }
    }

    return res.json({ success: true, data: cleaned });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
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
