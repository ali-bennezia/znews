const schedule = require("node-schedule");

const sourceModel = require("./../models/sourceModel");
const dataUtils = require("../utils/dataUtils");

module.exports = schedule.scheduleJob("* */30 * * * *", async function () {
  await dataUtils.fetchRecentNewsAsync();
});
