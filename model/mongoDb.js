const mongoose = require("mongoose");
const { Schema } = mongoose;

const FormFieldSchema = new Schema({
  type: { type: String},
  label: { type: String, required: true },
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
});

const FormButtonSchema = new Schema({
  type: { type: String, required: true },
  label: { type: String, required: true },
  actionType: { type: String, required: false },
  apiEndpoint: { type: String, required: false },
  apiMethod: { type: String, required: false },
});

const ApiConfigSchema = new Schema({
  apiUrl: { type: String, required: true },
  method: { type: String, required: true },
  description: { type: String, default: "" },
});

const TableColumnSchema = new Schema({
  type: { type: String, required: true },
  label: { type: String, required: true },
  name: { type: String, required: true },
  apiConfig: { type: ApiConfigSchema, required: false },
});

const TabSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["form", "table"], required: true },

  fields: [FormFieldSchema],
  buttons: [FormButtonSchema],

  tableCols: [TableColumnSchema],
  apiConfig: { type: ApiConfigSchema, required: false },
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
    subCategory: { type: String, default: "" },
    designName:{ type: String, default: "" },
    formFields: [FormFieldSchema],
    formButtons: [FormButtonSchema],
    tabs: [TabSchema],
    selectedDepartments: SelectedDepartmentSchema,
    selectedViews: [{ type: String }],
  },
  { timestamps: true }
);

ApiConfigSchema.methods.resolveUrl = function (params = {}) {
  let resolvedUrl = this.apiUrl;
  Object.entries(params).forEach(([key, value]) => {
    resolvedUrl = resolvedUrl.replace(`:${key}`, value);
  });
  return resolvedUrl;
};

module.exports = mongoose.model("FormDesigner", FormDesignerSchema);
