const uuid = require("uuid");
const v1 = uuid.v1;

const sourceModel = require("./../models/sourceModel");
const newsModel = require("./../models/newsModel");

const fileUtils = require("./fileUtils");
const stringUtils = require("./stringUtils");
const sanitationUtils = require("./sanitationUtils");

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
  let s = await sourceModel.find({
    $or: [{ identifier: identifier }, { name: name }, { url: url }],
  });
  if (s.length > 0) {
    if (s[0]) s[0].save();
    return s[0];
  }
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
  sourceIdentifier,
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
      sourceIdentifier: sourceIdentifier,
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

async function tryFindSourceAsync(id, url, name, identifier) {
  let sourceDocument = await sourceModel
    .findOne({
      $or: [
        { url: url },
        { _id: id },
        { name: name },
        { identifier: identifier },
      ],
    })
    .exec();
  return sourceDocument;
}
exports.tryFindSourceAsync = tryFindSourceAsync;

/*
  options: {
    query: ...,
    count: ...,
    source: ...,
    country: ...,
    sourceUrl: ...,
    sorting: {
      sortBy: ...,
      sortOrder: ...
    },
    timestamp: {
      fromDate: ...,
      timeFilter: ...
    }
  }
*/
async function getNewsAsync(opts) {
  if (!opts) opts = {};
  let optsCpy = sanitationUtils.trimOffAnyOtherPropertiesFromObjectSync(opts, [
    "query",
    "source",
    "sourceUrl",
    "country",
    "count",
    "sorting",
    "timestamp",
  ]);

  optsCpy.sorting = optsCpy?.sorting
    ? sanitationUtils.trimOffAnyOtherPropertiesFromObjectSync(optsCpy.sorting, [
        "sortBy",
        "sortOrder",
      ])
    : undefined;

  optsCpy.timestamp = optsCpy?.timestamp
    ? sanitationUtils.trimOffAnyOtherPropertiesFromObjectSync(
        optsCpy.timestamp,
        ["fromDate", "timeFilter"]
      )
    : undefined;

  let options = {
    query: null,
    source: null,
    sourceUrl: null,
    country: null,
    count: 20,
    sorting: {
      sortBy: "createdAt",
      sortOrder: 1,
    },
    timestamp: null,
    ...optsCpy,
  };

  let timeFilter = {},
    queryFilter = {},
    miscFilter = {},
    sortFilter = {};

  if (options?.timestamp?.fromDate && options?.timestamp?.timeFilter) {
    let ts = options.timestamp.fromDate;
    timeFilter =
      options.timestamp.timeFilter == 1
        ? { createdAt: { $gt: ts } }
        : { createdAt: { $lt: ts } };
  }

  if (options?.query) {
    queryFilter = { $text: { $search: options.query } };
    let findSrcs = [];
    if (options?.source) {
      findSrcs.push(options.source);
    }
    if (options?.sourceUrl) {
      let foundSrc = await sourceModel.findOne({ url: options?.sourceUrl });
      if (foundSrc) findSrcs.push(foundSrc._id);
    }
    if (findSrcs.length == 1) {
      queryFilter[source] = findSrcs[0];
    } else if (findSrcs.length > 1) {
      let multSourcesFilter = { $or: [] };
      for (let iSrc of findSrcs) {
        multSourcesFilter["$or"].push({ _id: iSrc });
      }
      queryFilter = { ...queryFilter, ...multSourcesFilter };
    }
  }

  if (options?.country) {
    miscFilter.country = options.country;
  }

  if (options?.sorting?.sortBy && options?.sorting?.sortOrder) {
    sortFilter[options.sorting.sortBy] = options.sorting.sortOrder;
  }

  let news = await newsModel
    .find({
      ...timeFilter,
      ...queryFilter,
    })
    .sort(sortFilter)
    .limit(options.count ? options.count : 20)
    .exec();

  return news;
}
exports.getNewsAsync = getNewsAsync;
