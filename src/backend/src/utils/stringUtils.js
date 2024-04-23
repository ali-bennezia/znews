const path = require("path");

function getUriExtension(uri) {
  let rawExt = path.extname(uri);
  return rawExt.split("?")[0];
}
exports.getUriExtension = getUriExtension;
