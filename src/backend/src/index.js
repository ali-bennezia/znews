// initialization

const express = require("express");
const mongoose = require("mongoose");
const initialization = require("./initialization");

const app = express();

initialization.initialize();

// config

// runtime

return;
app.listen(PORT, function (err) {
  if (err) {
    console.error(err);
    return;
  }
});
