const mongoose = require("mongoose");
const { Schema } = mongoose;

const ApiSchema = new Schema({
  name: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  description: { type: String },
});

const ModuleSchema = new Schema(
  {
    module: { type: String, required: true },
    apis: [ApiSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", ModuleSchema);
