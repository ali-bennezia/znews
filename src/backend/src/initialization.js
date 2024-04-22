const dotenv = require("dotenv");

exports.initialize = function () {
  const env = process.env.NODE_ENV || "development";

  console.log("Current detected environment: " + env);
  dotenv.config();

  const cfg = require(env == "production"
    ? "./../config/config.json"
    : "./../../../config/config.json");
  console.log(cfg);
  return cfg;
};
