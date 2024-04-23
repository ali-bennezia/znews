const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    url: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    tags: [{ type: String, required: true }],

    sourceType: { type: String, required: true }, // ['api%post', 'api%get', 'api%...', 'page']
    lastChecked: { type: Date, required: true },
    newsPointer: { type: String, required: true }, // json%data.articles, page%div.my-news
    selectors: [{ type: String, required: true }], // json%properties.images, dom-attrib%a.div.test%myAttribute, dom-content%a.element.p
    fetchNames: [
      {
        type: String,
        required: true,
        enum: ["url", "authors", "title", "description", "images", "tags"],
      },
    ],
    modifiers: [
      { type: String, required: true }, //["trimBegin", "trimEnd", "wrapInArray"], example: trimBegin%Show HN: %wrapInArray
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("source", schema);
