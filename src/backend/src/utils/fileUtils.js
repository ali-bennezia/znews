const fs = require("fs");
const https = require("https");
const path = require("path");
const stringUtils = require("./stringUtils");
const request = require("request");
const zlib = require("zlib");

function tryMkDirSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
exports.tryMkDirSync = tryMkDirSync;

function downloadImageAsync(url, targetNameWithoutExtension) {
  let ext = stringUtils.getUriExtension(url);
  let name = `${targetNameWithoutExtension}${ext}`;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(
      path.resolve(process.cwd(), "images", name)
    );

    const headers = {
      "Accept-Encoding": "gzip",
    };

    request({ url: url, headers: headers }).pipe(file);
    file.on("error", (error) => {
      fs.unlink(path);
      reject(error.message);
    });
    file.on("finish", () => {
      file.close(resolve(name));
    });
  });
}
exports.downloadImageAsync = downloadImageAsync;

function imageExistsSync(name) {
  return fs.existsSync(path.resolve(process.cwd(), "images", name));
}
exports.imageExistsSync = imageExistsSync;

function deleteImageSync(name) {
  fs.rmSync(path.resolve(process.cwd(), "images", name));
}
exports.deleteImageSync = deleteImageSync;

function deleteImagesSync(imageNames) {
  imageNames.map((i) => {
    deleteImageSync(i);
  });
}
exports.deleteImagesSync = deleteImagesSync;
