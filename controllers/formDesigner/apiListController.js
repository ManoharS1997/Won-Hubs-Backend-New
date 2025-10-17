const Module = require("../../model/apiSchema");

const createModule = async (req, res) => {
  try {
    const { module, apis } = req.body;

    if (!module) {
      return res
        .status(400)
        .json({ success: false, message: "Module name is required" });
    }

    const newModule = new Module({ module, apis });
    await newModule.save();

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: newModule,
    });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getModuleByName = async (req, res) => {
  try {
    const { moduleName } = req.params;

    if (!moduleName) {
      return res.status(400).json({
        success: false,
        message: "Module name is required.",
      });
    }

    const moduleData = await Module.findOne({ module: moduleName });

    if (!moduleData) {
      return res.status(404).json({
        success: false,
        message: `No module found with the name '${moduleName}'.`,
      });
    }

    res.status(200).json({
      success: true,
      data: moduleData,
    });
  } catch (error) {
    console.error("Error fetching module by name:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createModule, getModuleByName };
