const schedule = require("node-schedule");

const newsModel = require("./../models/newsModel");

const initialization = require("./../initialization");
const bCfg = initialization.getConfig("backend");

module.exports = schedule.scheduleJob("* */80 * * * *", async function () {
  let days = bCfg.daysAfterNewsDeletion;
  newsModel.deleteMany({
    createdAt: { $lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
  });
});
