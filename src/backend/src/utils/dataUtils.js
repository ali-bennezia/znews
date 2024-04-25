const sourceModel = require("../models/sourceModel");
const newsModel = require("../models/newsModel");

const axios = require("axios");
const puppeteer = require("puppeteer");
const sanitationUtils = require("./sanitationUtils");

const newsUtils = require("./newsUtils");
const stringUtils = require("./stringUtils");

async function fetchNewsRawDataAsync(
  sourceDocument,
  data,
  evalFuncAsync = null
) {
  let newsPointer = sourceDocument.newsPointer;
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
      if (evalFuncAsync) {
        var qry = pointerData[1];
        result = await data.$$eval(
          qry,
          evalFuncAsync,
          sourceDocument._id,
          sourceDocument.identifier,
          sourceDocument.tags,
          sourceDocument.selectors,
          sourceDocument.fetchNames,
          sourceDocument.modifiers
        );
      } else result = [];
      break;
    default:
      result = [];
      break;
  }
  return result;
}

function fetchRawNewsSingleDataSync(rawNews, selector, fetchName, modifier) {
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
      result = rawNews
        .querySelector(selectorData[1])
        .getAttribute(selectorData[2]);
      break;
    case "dom-content":
      result = rawNews.querySelector(selectorData[1]).textContent;
      break;
    case "none":
      result = "";
      break;
    case "none-array":
      result = [];
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
      result = result == null ? [] : [result];
      break;
    case "emptyIfNull":
      if (result == null) result = "";
      break;
    case "none":
      result = result;
      break;
    default:
      break;
  }

  return {
    name: fetchName,
    content: result,
  };
}

async function processRawApiNewsDataAsync(
  rawNewsArray,
  sourceId,
  sourceIdentifier,
  sourceTags,
  selectors,
  fetchNames,
  modifiers
) {
  let result = [];
  for (let n of rawNewsArray) {
    let pNews = {
      source: sourceId,
      sourceIdentifier: sourceIdentifier,
      tags: sourceTags,
    };
    let i = 0;
    for (let s of selectors) {
      let data = fetchRawNewsSingleDataSync(n, s, fetchNames[i], modifiers[i]);
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
        "sourceIdentifier",
        "title",
        "description",
        "url",
        "authors",
        "images",
        "tags",
      ])
    ) {
      result.push(pNews);
    } else {
    }
  }

  return result;
}

async function processRawPageNewsDataAsync(
  rawNewsElementArrayDOM,

  sourceId,
  sourceIdentifier,
  sourceTags,

  selectors,
  fetchNames,
  modifiers
) {
  return await Promise.all(
    rawNewsElementArrayDOM.map(async (n) => {
      let pNews = {
        source: sourceId,
        sourceIdentifier: sourceIdentifier,
        tags: sourceTags,
        datas: [],
      };
      let i = 0;
      for (let s of selectors) {
        let rawNews = n;
        let selector = s;
        let fetchName = fetchNames[i];
        let modifier = modifiers[i];
        let selectorData = selector.split("%");
        let selectorCommand = selectorData[0];
        let result = null;
        switch (selectorCommand) {
          case "json":
            let jsonPath = selectorData[1];
            let jsonPathData = jsonPath.split(".");
            for (let i = 0; i < jsonPathData.length; ++i) {
              result =
                i == 0 ? rawNews[jsonPathData[i]] : result[jsonPathData[i]];
              if (result == undefined) break;
            }
            break;
          case "dom-attrib":
            let elm = rawNews.querySelector(selectorData[1]);
            result = elm ? elm.getAttribute(selectorData[2]) : undefined;
            break;
          case "dom-content":
            let elm2 = rawNews.querySelector(selectorData[1]);
            result = elm2 ? elm2.textContent : undefined;
            break;
          case "default":
            result = result;
            break;
          case "none":
            result = "";
            break;
          case "none-array":
            result = [];
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
              result = result.substring(
                0,
                result.length - modifierData[1].length
              );
            }
            break;
          case "wrapInArray":
            result = result == null ? [] : [result];
            break;
          case "emptyIfNull":
            if (result == null) result = "";
            break;
          case "none":
            result = result;
            break;
          default:
            break;
        }

        let data = {
          name: fetchName,
          content: result,
        };
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
        await objectHasAllPropertiesAsync(pNews, [
          "source",
          "sourceIdentifier",
          "title",
          "description",
          "url",
          "authors",
          "images",
          "tags",
        ])
      )
        return pNews;
      else return null;
    })
  );
}

async function fetchApiNewsAsync(sourceDocument, method) {
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: sourceDocument.url,
    })
      .then(async (data) => {
        let rawNews = await fetchNewsRawDataAsync(sourceDocument, data.data);
        let news = await processRawApiNewsDataAsync(
          rawNews,
          sourceDocument._id,
          sourceDocument.identifier,
          sourceDocument.tags,
          sourceDocument.selectors,
          sourceDocument.fetchNames,
          sourceDocument.modifiers
        );

        let results = await Promise.all(
          news.map(async (n) =>
            newsUtils.tryRegisterNewsAsync(
              n.source,
              n.sourceIdentifier,
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
        console.log(err);
        reject(err);
      });
  });
}
exports.fetchApiNewsAsync = fetchApiNewsAsync;

async function fetchPageNewsAsync(sourceDocument) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.exposeFunction(
    "fetchRawNewsSingleDataAsync",
    fetchRawNewsSingleDataSync
  );
  await page.exposeFunction(
    "objectHasAllPropertiesAsync",
    sanitationUtils.objectHasAllPropertiesSync
  );
  await page.goto(sourceDocument.url);
  let news = await fetchNewsRawDataAsync(
    sourceDocument,
    page,
    processRawPageNewsDataAsync
  );
  await page.close();
  await browser.close();
  let results = await Promise.all(
    news.map(async (n) =>
      newsUtils.tryRegisterNewsAsync(
        n.source,
        n.sourceIdentifier,
        stringUtils.joinURLsBySlash(sourceDocument.url, n.url),
        n.authors,
        n.title,
        n.description,
        n.images,
        n.tags
      )
    )
  );
  return results;
}
exports.fetchPageNewsAsync = fetchPageNewsAsync;

async function fetchSourceNewsAsync(sourceId) {
  let sourceDocument = await sourceModel.findById(sourceId);
  if (sourceDocument == null) return [];
  sourceDocument.lastChecked = Date.now();
  await sourceDocument.save();
  let typeData = sourceDocument.sourceType.split("%");
  let data = null;
  switch (typeData[0]) {
    case "api":
      data = await fetchApiNewsAsync(sourceDocument, typeData[1]);
      break;
    case "page":
      data = await fetchPageNewsAsync(sourceDocument);
      break;
    default:
      data = [];
      break;
  }
  return data;
}
exports.fetchSourceNewsAsync = fetchSourceNewsAsync;

async function fetchRecentNewsAsync() {
  const init = require("./../initialization");
  const bCfg = init.getConfig("backend");

  let sources = await sourceModel
    .find()
    .limit(15)
    .sort({ lastChecked: 1 })
    .exec();

  let i = 0;
  for (let s of sources) {
    if (i >= bCfg.sourceFetchBatchSize) break;
    await fetchSourceNewsAsync(s._id);
    ++i;
  }
}
exports.fetchRecentNewsAsync = fetchRecentNewsAsync;
