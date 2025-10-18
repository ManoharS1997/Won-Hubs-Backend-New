// models/Module.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const FormFieldSchema = new Schema({
  type: { type: String, required: true },
  label: { type: String, required: true },
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  
});

const FormButtonSchema = new Schema({
  type: { type: String, required: true },
  label: { type: String, required: true },
  actionType: { type: String, required: false },
  apiEndpoint: { type: String, required: false },
  apiMethod: { type: String, required: false },
});

const TabSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["form", "table"], required: true },
  fields: [FormFieldSchema],
  buttons: [FormButtonSchema],
  tableCols: [FormFieldSchema],
});

const SelectedDepartmentSchema = new Schema({
  department: { type: String, required: true },
  category: { type: String },
  sub_category: { type: String },
});

const FormDesignerSchema = new Schema(
  {
    module: { type: String, required: true },
    widgetname: { type: String, default: "" },
    departmentName: { type: String, default: "" },
    category: { type: String, default: "" },
    column:{type:Boolean,default:false},
    formFields: [FormFieldSchema],
    formButtons: [FormButtonSchema],
    tabs: [TabSchema],

    selectedDepartments: SelectedDepartmentSchema,
    selectedViews: [{ type: String }], // e.g. ['Super Admin', 'Admin']
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormDesigner", FormDesignerSchema);