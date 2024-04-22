const fs = require("fs");
const https = require("https");

function tryMkDirSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdir(path);
  }
}
exports.tryMkDirSync = tryMkDirSync;

function downloadImageAsync(url, path) {
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve(true));
        });
      })
      .on("error", (error) => {
        fs.unlink(path);
        reject(error.message);
      });
  });
}
exports.downloadImageAsync = downloadImageAsync;
