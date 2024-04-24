const dotenv = require("dotenv");
const fileUtils = require("./utils/fileUtils");
const path = require("path");

var configs = [];

function loadConfig(identifier, data) {
  configs.push({
    identifier: identifier,
    data: data,
  });
}
exports.loadConfig = loadConfig;

function getConfig(identifier) {
  return configs.find((c) => c.identifier == identifier).data;
}
exports.getConfig = getConfig;

function removeConfig(identifier) {
  configs.splice(
    configs.findIndex((c) => c.identifier == identifier),
    1
  );
}
exports.removeConfig = removeConfig;

exports.initialize = function () {
  console.log("Initializing Znews back-end server.");

  var e = process.argv[2] || "dev";
  switch (e) {
    case "dev":
      process.env.NODE_ENV = "development";
      break;
    case "prod":
      process.env.NODE_ENV = "production";
      break;
  }

  fileUtils.tryMkDirSync("static");

  const env = process.env.NODE_ENV || "development";

  console.log("Current detected environment: " + env);

  if (env == "development") {
    dotenv.config({
      path: path.resolve(process.cwd(), "..", "..", "config", "backend-.env"),
    });
  } else {
    dotenv.config();
  }

  const cfg = require(env == "production"
    ? "./../config/config.json"
    : "./../../../config/config.json");
  const bCfg = require(env == "production"
    ? "./../config/backend-config.json"
    : "./../../../config/backend-config.json");

  fileUtils.tryMkDirSync(bCfg.imageStorage);
  fileUtils.tryMkDirSync(bCfg.testImageStorage);

  loadConfig("main", cfg);
  loadConfig("backend", bCfg);

  console.log("Parameters were successfully loaded from config files.");
  console.log("== Configurations ==");
  for (let c of configs) {
    console.log("Configuration identifier: '" + c.identifier + "'");
    console.log("Configuration data: ");
    console.log(c.data);
    console.log("--");
  }
  console.log("==");

  return cfg;
};
