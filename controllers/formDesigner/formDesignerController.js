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
  try {
    const { category, subcategory, view, department, module } = req.body;

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
  const { module } = req.params;
  const data = req.body || {};
  try {
    const formSchema = await FormDesigner.findOne({ module });
    if (!formSchema) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    const formFields = formSchema.formFields.map((f) => f.name);
    const newFields = Object.keys(data).filter(
      (key) => !formFields.includes(key)
    );
    console.log(formFields, "=================");
    console.log(newFields, "=================");

    if (newFields.length > 0) {
      newFields.forEach((field) => {
        formSchema.formFields.push({ label: field, name: field });
      });
      // await formSchema.save();

      for (const field of newFields) {
        console.log(`ALTER TABLE ${module} ADD COLUMN ${field} VARCHAR(255)`)

        await db.query(
          `ALTER TABLE ${module} ADD COLUMN ${field} VARCHAR(255)`
        );
      }
    }

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => "?").join(", ");
    const query = `INSERT INTO ${module} (${columns.join(
      ","
    )}) VALUES (${placeholders})`;

    await db.query(query, values);

    res.json({ success: true, message: "Record created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
};
