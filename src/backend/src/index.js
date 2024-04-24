// initialization

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const initialization = require("./initialization.js");

const app = express();
const router = express.Router();

// config

initialization.initialize();
const mainCfg = initialization.getConfig("main");
const backEndCfg = initialization.getConfig("backend");
const PORT = backEndCfg.port ?? 5000;

// API

// static files

router.get("*", (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "static", "index.html"));
});

app.use("", express.static("./static"));
app.use("images", express.static("./" + backEndCfg.imageSource));
app.use(router);

// runtime

mongoose
  .connect(backEndCfg.databaseUrl)
  .then((data) => {
    console.log("Database link succesfully established.");
    app.listen(PORT, function (err) {
      if (err) {
        console.error("Error! Application startup failed.");
        console.error(err);
        return;
      }
      console.log("Application succesfully started.");
      initialization.initializeSources();
    });
  })
  .catch((err) => {
    console.error("Error! MongoDB database connection attempt failed.");
    console.error(err);
  });

// jobs

require("./jobs/scrapJob.js");
require("./jobs/gcJob.js");
