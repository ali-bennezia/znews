const path = require("path");

function getUriExtension(uri) {
  let rawExt = path.extname(uri);
  return rawExt.split("?")[0];
}
exports.getUriExtension = getUriExtension;

function extractParamsFromUrl(url) {
  let dat = url.split("?");
  return "?" + dat[dat.length - 1];
}
exports.extractParamsFromUrl = extractParamsFromUrl;

function getUrlWithoutParams(url) {
  let dat = url.split("?");
  dat.pop();
  dat = dat.join("").split("");
  return dat.join("");
}
exports.getUrlWithoutParams = getUrlWithoutParams;

function getUrlSLD(url) {
  return url
    .replace("https://", "")
    .replace("http://", "")
    .replace(".www", "")
    .split("/")[0];
}
exports.getUrlSLD = getUrlSLD;

function trimLastSlashFromURL(url) {
  if (url.endsWith("/")) {
    let arr = url.split("");
    arr.pop();
    return arr.join("");
  }
  return url;
}
exports.trimLastSlashFromURL = trimLastSlashFromURL;

function trimFirstSlashFromURL(url) {
  if (url.startsWith("/")) {
    let arr = url.split("");
    arr.shift();
    return arr.join("");
  }
  return url;
}
exports.trimFirstSlashFromURL = trimFirstSlashFromURL;

function joinURLsBySlash(url1, url2) {
  return [trimLastSlashFromURL(url1), trimFirstSlashFromURL(url2)].join("/");
}
exports.joinURLsBySlash = joinURLsBySlash;
