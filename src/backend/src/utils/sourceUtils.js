const sourceModel = require("./../models/sourceModel");
const newsModel = require("./../models/newsModel");

const axios = request("axios");
const sanitationUtils = require("./sanitationUtils");

const newsUtils = require("./newsUtils");

async function fetchNewsRawDataAsync(newsPointer, data) {
  let pointerData = newsPointer.split("%");
  let pointerCommand = pointerData[0];
  let result;
  switch (pointerCommand) {
    case "json":
      let jsonPath = pointerData[1];
      let jsonPathData = jsonPath.split(".");
      for (let i = 0; i < jsonPathData.length; ++i) {
        result = i == 0 ? data[jsonPathData[i]] : result[jsonPathData[i]];
      }
      break;
    case "page":
      let qry = pointerData[1];
      result = await page.evaluate(
        () => Array.from(document.querySelectorAll(qry)),
        (e) => e
      );
      break;
    default:
      result = [];
      break;
  }
  return result;
}

async function fetchRawNewsSingleDataAsync(
  rawNews,
  selector,
  fetchName,
  modifier
) {
  let selectorData = selector.split("%");
  let selectorCommand = selectorData[0];
  let result = null;
  switch (selectorCommand) {
    case "json":
      let jsonPath = selectorData[1];
      let jsonPathData = jsonPath.split(".");
      for (let i = 0; i < jsonPathData.length; ++i) {
        result = i == 0 ? rawNews[jsonPathData[i]] : result[jsonPathData[i]];
      }
      break;
    case "dom-attrib":
      result = await page
        .waitForSelector(selectorData[1])
        .getAttribute(selectorData[2]);
      break;
    case "dom-content":
      result = await page.waitForSelector(selectorData[1]).textContent;
      break;
    default:
      break;
  }

  let modifierData = modifier.split("%");
  let modifierCommand = modifierData[0];

  switch (modifierCommand) {
    case "trimBegin":
      if (result.startsWith(modifierData[1])) {
        result = result.substring(modifierData[1].length);
      }
      break;
    case "trimEnd":
      if (result.endsWith(modifierData[1])) {
        result = result.substring(0, result.length - modifierData[1].length);
      }
      break;
    case "wrapInArray":
      result = [result];
      break;
    default:
      break;
  }
  return {
    name: fetchName,
    content: result,
  };
}

async function processRawNewsDataAsync(
  rawNewsArray,
  sourceId,
  sourceTags,
  selectors,
  fetchNames,
  modifiers
) {
  let result = [];
  for (let n of rawNewsArray) {
    let pNews = {
      source: sourceId,
      tags: sourceTags,
    };
    let i = 0;
    for (let s of selectors) {
      let data = await fetchRawNewsSingleDataAsync(
        n,
        s,
        fetchNames[i],
        modifiers[i]
      );
      if (
        data.name in pNews &&
        Array.isArray(data.content) &&
        Array.isArray(pNews[data.name])
      ) {
        pNews[data.name] = [...pNews[data.name], ...data.content];
      } else pNews[data.name] = data.content;

      ++i;
    }
    if (
      sanitationUtils.objectHasAllPropertiesSync(pNews, [
        "source",
        "title",
        "description",
        "url",
        "authors",
        "images",
        "tags",
      ])
    ) {
      results.push(pNews);
    }
  }
  return result;
}

async function fetchApiNewsAsync(sourceDocument, method) {
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: source.url,
    })
      .then(async (data) => {
        let rawNews = await fetchNewsRawDataAsync(
          sourceDocument.newsPointer,
          data
        );
        let news = await processRawNewsDataAsync(
          rawNews,
          sourceDocument._id,
          sourceDocument.tags,
          sourceDocument.selectors,
          sourceDocument.fetchNames,
          sourceDocument.modifiers
        );
        let results = await Promise.all(
          news.map(async (n) =>
            newsUtils.registerNewsAsync(
              n.source,
              n.url,
              n.authors,
              n.title,
              n.description,
              n.images,
              n.tags
            )
          )
        );
        resolve(results);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
exports.fetchApiNewsAsync = fetchApiNewsAsync;
