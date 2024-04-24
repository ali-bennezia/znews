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
