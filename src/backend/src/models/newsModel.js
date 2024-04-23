const mongoose = require("mongoose");
const fileUtils = require("./../utils/fileUtils");

const schema = new mongoose.Schema(
  {
    source: { type: mongoose.Types.ObjectId, ref: "source", required: true },
    authors: [{ type: String, required: true }],
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    tags: [{ type: String, required: true }],
  },
  { timestamps: true }
);

schema.pre("remove", { document: true, query: false }, async function (next) {
  for (let i of this.images) {
    fileUtils.deleteImageSync(i);
  }

  next();
});

module.exports = mongoose.model("news", schema);
