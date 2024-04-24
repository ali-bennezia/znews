const uuid = require("uuid");
const v1 = uuid.v1;

const sourceModel = require("./../models/sourceModel");
const newsModel = require("./../models/newsModel");

const fileUtils = require("./fileUtils");
const stringUtils = require("./stringUtils");
const sourceUtils = require("./sourceUtils");

async function tryRegisterSourceAsync(
  name,
  identifier,
  url,
  country,
  tags,

  sourceType,
  newsPointer,
  selectors,
  fetchNames,
  modifiers
) {
  let s = await sourceModel.exists({ url: url });
  if (s) return s;
  return await sourceModel.create({
    name: name,
    identifier: identifier,
    url: url,
    country: country,
    tags: tags,
    sourceType: sourceType,
    lastChecked: new Date(),
    newsPointer: newsPointer,
    selectors: selectors,
    fetchNames: fetchNames,
    modifiers: modifiers,
  });
}
exports.tryRegisterSourceAsync = tryRegisterSourceAsync;

async function tryRegisterNewsAsync(
  sourceId,
  url,
  authors,
  title,
  description,
  imageExternalURLs,
  tags
) {
  let n = await newsModel.find().or([{ title: title }, { url: url }]);
  if (n.length > 0) return n[0];

  let imageNames = await Promise.all(
    imageExternalURLs.map(async (i) => {
      let ext = stringUtils.getUriExtension(i);
      let nameNoExtension = v1();
      let nameWithExtension = `${nameNoExtension}${ext}`;
      await fileUtils.downloadImageAsync(i, nameNoExtension);
      return nameWithExtension;
    })
  );

  return await newsModel
    .create({
      source: sourceId,
      url: url,
      authors: authors,
      title: title,
      description: description,
      images: imageNames,
      tags: tags,
    })
    .catch((err) => {
      fileUtils.deleteImagesSync(imageNames);
    });
}
exports.tryRegisterNewsAsync = tryRegisterNewsAsync;

async function clearSourceAndNewsAsync() {
  await sourceModel.deleteMany({});
  await newsModel.deleteMany({});
}
exports.clearSourceAndNewsAsync = clearSourceAndNewsAsync;
