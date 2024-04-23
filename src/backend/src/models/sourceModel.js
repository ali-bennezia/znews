const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    lastChecked: { type: Date, required: true },
    selectors: [{ type: String, required: true }],
    fetchModes: [{ type: String, required: true }],
    modifiers: [{ type: String, required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("source", schema);
