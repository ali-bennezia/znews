const fs = require("fs");
const https = require("https");
const path = require("path");
const stringUtils = require("./stringUtils");

function tryMkDirSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
exports.tryMkDirSync = tryMkDirSync;

function downloadImageAsync(url, targetNameWithoutExtension) {
  let ext = stringUtils.getUriExtension(url);
  let name = `${targetNameWithoutExtension}${ext}`;

  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(
      path.resolve(process.cwd(), "images", name)
    );
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve(name));
        });
      })
      .on("error", (error) => {
        fs.unlink(path);
        reject(error.message);
      });
  });
}
exports.downloadImageAsync = downloadImageAsync;

function deleteImageSync(name) {
  fs.rmSync(path.resolve(process.cwd(), "images", name));
}
exports.deleteImageSync = deleteImageSync;
