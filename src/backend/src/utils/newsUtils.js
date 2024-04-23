const uuid = require("uuid");
const v1 = uuid.v1;

const sourceModel = require("./../models/sourceModel");
const newsModel = require("./../models/newsModel");

const fileUtils = require("./fileUtils");
const stringUtils = require("./stringUtils");

async function registerNewsAsync(
  sourceId,
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
