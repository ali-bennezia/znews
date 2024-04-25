// initialization

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const wsExpress = require("websocket-express");
const initialization = require("./initialization.js");

const dataUtils = require("./utils/dataUtils.js");

const app = express();
const wsApp = new wsExpress.WebSocketExpress();

// config

initialization.initialize();
const mainCfg = initialization.getConfig("main");
const backEndCfg = initialization.getConfig("backend");
const PORT = backEndCfg.port ?? 5000;

// API

// static files

const contentRouter = express.Router();
contentRouter.get("*", (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "static", "index.html"));
});

// HTTP routing

app.use("", express.static("./static"));
app.use("images", express.static("./" + backEndCfg.imageSource));
app.use(contentRouter);

// WS routing

wsApp.use("/news", require("./routing/newsRouting.js"));

// runtime

const wsServer = wsApp.createServer();

mongoose
  .connect(backEndCfg.databaseUrl)
  .then((data) => {
    console.log("Database link successfully established.");
    app.listen(PORT, function (err) {
      if (err) {
        console.error("Error! Application startup failed.");
        console.error(err);
        return;
      }
      initialization.initializeSources();
      console.log("HTTP server successfully started.");
      wsServer.listen(backEndCfg.webSocketPort, undefined, () => {
        console.log("WebSocket secret successfully started.");
      });
    });
  })
  .catch((err) => {
    console.error("Error! MongoDB database connection attempt failed.");
    console.error(err);
  });

// jobs

require("./jobs/scrapJob.js");
require("./jobs/gcJob.js");

dataUtils.fetchRecentNewsAsync();
