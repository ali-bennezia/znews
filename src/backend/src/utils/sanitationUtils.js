const sourceModel = require("./../models/sourceModel");

const fileUtils = require("./fileUtils");
const newsUtils = require("./newsUtils");

function objectHasAllPropertiesSync(object, properties) {
  for (let p of properties) {
    if (!(p in object)) {
      return false;
    }
  }
  return true;
}
exports.objectHasAllPropertiesSync = objectHasAllPropertiesSync;

function objectHasNoOtherPropertiesButSync(object, properties) {
  for (let p in object) {
    if (!properties.includes(p)) return false;
  }
  return true;
}
exports.objectHasNoOtherPropertiesButSync = objectHasNoOtherPropertiesButSync;

function trimOffAnyOtherPropertiesFromObjectSync(object, properties) {
  let cpy = object;
  for (let p in cpy) {
    if (!properties.includes(p)) delete cpy[p];
  }
  return cpy;
}
exports.trimOffAnyOtherPropertiesFromObjectSync =
  trimOffAnyOtherPropertiesFromObjectSync;

function formatSourceSync(sourceDocument) {
  return {
    id: sourceDocument._id,
    identifier: sourceDocument.identifier,
    name: sourceDocument.name,
    url: sourceDocument.url,
    country: sourceDocument.country,
    tags: sourceDocument.tags,
    createdAt: sourceDocument.createdAt,
  };
}
exports.formatSourceSync = formatSourceSync;

async function formatNewsAsync(newsDocument) {
  let sourceDocument = await newsUtils.tryFindSourceAsync(
    newsDocument.source,
    undefined,
    undefined,
    newsDocument.sourceIdentifier
  );

  return {
    source: sourceDocument ? formatSourceSync(sourceDocument) : null,
    url: newsDocument.url,
    authors: newsDocument?.authors ? newsDocument.authors : [],
    title: newsDocument.title,
    description: newsDocument.description,
    images: newsDocument?.images
      ? newsDocument.images.map(
          (i) => `${fileUtils.getImageStorageFileName()}/${i}`
        )
      : [],
    tags: newsDocument?.tags ? newsDocument.tags : [],
    createdAt: newsDocument.createdAt,
  };
}
exports.formatNewsAsync = formatNewsAsync;

async function formatNewsArrayAsync(newsDocuments) {
  return await Promise.all(
    newsDocuments.map(async (newsDocument) => {
      return await formatNewsAsync(newsDocument);
    })
  );
}
exports.formatNewsArrayAsync = formatNewsArrayAsync;
