const mongoose = require("mongoose");

const stringUtils = require("./../utils/stringUtils");

async function getSourceApiKeyAsync(source) {
  let internalIdentifier = source.identifier;
  let varName = `SOURCEPARAM${internalIdentifier}`;
  if (process.env[varName]) {
    let data = process.env[varName].split("%");
    return {
      paramName: data[0],
      value: data[1],
    };
  } else {
    return null;
  }
}

const schema = new mongoose.Schema(
  {
    sourceParams: [{ type: String, required: false }],
    name: { type: String, required: true, unique: true },
    identifier: { type: String, required: true, unique: true },
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
        enum: [
          "url",
          "authors",
          "title",
          "description",
          "images",
          "tags",
          "reportedAt",
        ],
      },
    ],
    modifiers: [
      { type: String, required: true }, //["trimBegin", "trimEnd", "wrapInArray", "emptyIfNull", "default", "none", "none-array"], example: trimBegin%Show HN: %wrapInArray
    ],
  },
  { timestamps: true }
);

schema.pre("save", async function () {
  if (this.isModified("url")) {
    let params = stringUtils.extractParamsFromUrl(this.url);
    let p = new URLSearchParams(params);
    let apiKeyData = await getSourceApiKeyAsync(this);
    if (apiKeyData) {
      let varKey = apiKeyData.value;
      let targetParamName = apiKeyData.paramName;
      if (!this.sourceParams || !this.sourceParams.includes(targetParamName)) {
        p.append(targetParamName, varKey);
        this.url = `${stringUtils.getUrlWithoutParams(
          this.url
        )}?${p.toString()}`;
        this.sourceParams = this.sourceParams
          ? [...this.sourceParams, targetParamName]
          : [targetParamName];
      }
    }
  }
});

module.exports = mongoose.model("source", schema);
