const schedule = require("node-schedule");

const sourceModel = require("./../models/sourceModel");
const sourceUtils = require("./../utils/sourceUtils");

const init = require("./../initialization");
const bCfg = init.getConfig("backend");

module.exports = schedule.scheduleJob("* */30 * * * *", async function () {
  let sources = await sourceModel.find().limit(15).sort({ lastChecked: 1 });

  let i = 0;
  for (let s of sources) {
    if (i >= bCfg.sourceFetchBatchSize) break;
    sourceUtils.fetchSourceNewsAsync(s._id);
    ++i;
  }

  console.log("test");
});
