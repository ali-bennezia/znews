const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const fileUtils = require("./../utils/fileUtils");

const schema = new mongoose.Schema(
  {
    source: {
      type: mongoose.Types.ObjectId,
      ref: "source",
      required: true,
      unique: false,
    },
    sourceIdentifier: {
      type: String,
      required: true,
      unique: false,
    },
    url: { type: String, required: true, unique: false },
    authors: [{ type: String, required: true }],
    title: { type: String, required: true, unique: true },
    description: { type: String, required: false, unique: false },
    images: [{ type: String, required: false }],
    tags: [{ type: String, required: false }],
    reportedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

schema.index({ title: "text", description: "text" });
schema.plugin(mongoosePaginate);

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
