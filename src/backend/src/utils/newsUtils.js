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
  tags,
  reportedAt
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
      reportedAt: reportedAt,
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
    page: ....,
    sorting: {
      sortBy: ..., ['reportedAt', 'createdAt', 'content', 'source' 'tags']
      sortOrder: ...,
    },
  }
*/
async function getNewsAsync(opts) {
  if (!opts) opts = {};
  let optsCpy = sanitationUtils.trimOffAnyOtherPropertiesFromObjectSync(opts, [
    "query",
    "count",
    "source",
    "country",
    "sourceUrl",
    "page",
    "sorting",
  ]);

  optsCpy.sorting = optsCpy?.sorting
    ? sanitationUtils.trimOffAnyOtherPropertiesFromObjectSync(optsCpy.sorting, [
        "sortBy",
        "sortOrder",
      ])
    : undefined;

  if (
    ![
      "reportedAt",
      "createdAt",
      "content",
      "sourceIdentifier",
      "tags",
    ].includes(optsCpy?.sorting?.sortBy) ||
    ![-1, 1].includes(optsCpy?.sorting?.sortOrder)
  ) {
    optsCpy.sorting = undefined;
  }

  optsCpy.query = optsCpy.query && optsCpy.query == "" ? null : optsCpy.query;

  let options = {
    query: null,
    source: null,
    sourceUrl: null,
    country: null,
    count: 20,
    page: 0,
    ...optsCpy,
    sorting: {
      sortBy: "createdAt",
      sortOrder: 1,
      ...optsCpy.sorting,
    },
  };

  let findFilter = {},
    sortFilter = {};

  if (options.query) {
    // Query tags
    let queryData = options.query.split(" ");
    if (queryData.find((el) => el.startsWith("%") && el.endsWith("%"))) {
      let dataTags = queryData.filter(
        (el) => el.startsWith("%") && el.endsWith("%")
      );

      for (let dataTag of dataTags) {
        let clnTag = dataTag.replaceAll("%", "");
        let clnTagData = clnTag.split(":");
        if (
          [
            "reportedAt",
            "createdAt",
            "content",
            "sourceIdentifier",
            "tags",
          ].includes(clnTagData[0])
        ) {
          console.log(
            "includes '" + clnTagData[0] + " for data '" + clnTagData[1] + "'"
          );
          findFilter[clnTagData[0]] = clnTagData[1];
          options.query = options.query.replaceAll(dataTag, "");
          if (options.query == "") {
            options.query = undefined;
          }
        }
      }
    }
    if (options.query) {
      // Query
      findFilter = { ...findFilter, $text: { $search: options.query } };
    }
  }

  if (options.source || options.sourceUrl) {
    let sourceFromUrl = await sourceModel.findOne({ url: options.sourceUrl });
    let findSources = [options.source];
    if (sourceFromUrl) findSources.push(sourceFromUrl._id);
    findFilter = { ...findFilter, source: findSources };
  }

  if (options.country) {
    findFilter = { ...findFilter, country: options.country };
  }

  if (options.sorting) {
    if (options.sorting.sortBy == "content") {
      sortFilter = {
        ...sortFilter,
        title: options.sorting.sortOrder,
        description: options.sorting.sortOrder,
      };
    } else {
      sortFilter[options.sorting.sortBy] = options.sorting.sortOrder;
    }
  }

  let cnt = options.count ? options.count : 20;
  /*
  let news = await newsModel
    .find({
      ...findFilter,
    })
    .sort(sortFilter)
    .skip(cnt * options.page)
    .limit(cnt)
    .exec();*/
  console.log(findFilter);

  let news2 = await newsModel.paginate(
    { ...findFilter },
    { page: options.page + 1, limit: cnt, sort: sortFilter }
  );
  return news2.docs;
}
exports.getNewsAsync = getNewsAsync;
