const schedule = require("node-schedule");

const newsModel = require("./../models/newsModel");
const sourceModel = require("./../models/sourceModel");

module.exports = schedule.scheduleJob("* */20 * * * *", function () {});
