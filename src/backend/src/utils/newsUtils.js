const uuid = require("uuid");
const v1 = uuid.v1;

const sourceModel = require("./../models/sourceModel");
const newsModel = require("./../models/newsModel");

const fileUtils = require("./fileUtils");
const stringUtils = require("./stringUtils");
const sourceUtils = require("./sourceUtils");

async function tryRegisterSourceAsync(
  name,
  url,
  country,
  tags,
  sourceType,
  selectors,
  fetchNames,
  fetchModes,
  modifiers
) {
  if (await sourceModel.exists({ url: url })) return;
  return sourceModel.create({
    name: name,
    url: url,
    country: country,
    tags: tags,
    sourceType: sourceType,
    lastChecked: new Date(),
    selectors: selectors,
    fetchNames: fetchNames,
    fetchModes: fetchModes,
    modifiers: modifiers,
  });
}
exports.tryRegisterSourceAsync = tryRegisterSourceAsync;

async function fetchNewsFromSourceAsync(sourceId) {
  let source = await sourceModel.findById(sourceId);
  source.lastChecked = new Date();
  await source.save();

  let typeData = source.sourceType.split("%");
  switch (typeData[0]) {
    case "api":
      break;
    case "page":
      break;
    default:
      break;
  }

  // TODO
}
exports.fetchNewsFromSourceAsync = fetchNewsFromSourceAsync;

async function registerNewsAsync(
  sourceId,
  url,
  authors,
  title,
  description,
  imageExternalURLs,
  tags
) {
  let imageNames = await Promise.all(
    imageExternalURLs.map(async (i) => {
      let ext = stringUtils.getUriExtension(i);
      let nameNoExtension = v1();
      let nameWithExtension = `${nameNoExtension}${ext}`;
      await fileUtils.downloadImageAsync(i, nameNoExtension);
      return nameWithExtension;
    })
  );

  return newsModel
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
exports.registerNewsAsync = registerNewsAsync;

async function clearSourceAndNewsAsync() {
  await sourceModel.deleteMany({});
  await newsModel.deleteMany({});
}
exports.clearSourceAndNewsAsync = clearSourceAndNewsAsync;
