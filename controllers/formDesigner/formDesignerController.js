const mongoose = require("mongoose");
const FormDesigner = require("../../model/mongoDb");

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
    const { category, subcategory, view, department } = req.body;

    if (!category || !subcategory || !view || !department) {
      return res.status(400).json({
        success: false,
        error: "BadRequest",
        message:
          "All fields (category, subcategory, view, department) are required.",
      });
    }

    const module = await FormDesigner.findOne({
      "selectedDepartments.department": department,
      category: category,
      "selectedDepartments.sub_category": subcategory,
      selectedViews: { $in: [view] },
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "No module found for the given filters.",
      });
    }

    return res.status(200).json({
      success: true,
      data: module,
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

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleByFields,
};
