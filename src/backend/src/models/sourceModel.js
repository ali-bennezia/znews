const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    url: { type: String, required: true, unique: true },
    country: { type: String, required: true },

    sourceType: { type: String, required: true, enum: ["api", "page"] },
    lastChecked: { type: Date, required: true },
    selectors: [{ type: String, required: true }],
    fetchModes: [{ type: String, required: true }], // ['json', 'attrib', 'content']
    modifiers: [
      { type: String, required: true }, //["trimBegin", "trimEnd"]
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("source", schema);
