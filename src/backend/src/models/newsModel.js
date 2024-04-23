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

schema.pre(
  ["deleteOne", "deleteMany"],
  { document: false, query: true },
  async function (next) {
    let docs = await this.model.find(this.getFilter());

    for (let doc of docs) {
      for (let i of doc.images) {
        fileUtils.deleteImageSync(i);
      }
    }

    next();
  }
);

module.exports = mongoose.model("news", schema);
