const initialization = require("./../src/initialization.js");
const mongoose = require("mongoose");

initialization.initialize();
const backEndCfg = initialization.getConfig("backend");

mongoose
  .connect(backEndCfg.databaseUrl)
  .then((data) => {
    console.log("Database link succesfully established for tests.");
    run();
  })
  .catch((err) => {
    console.error("Error! MongoDB database connection attempt failed.");
    console.error(err);
  });

const assert = require("assert");

const sourceModel = require("./../src/models/sourceModel.js");
const newsModel = require("./../src/models/newsModel.js");

async function dummyInsert() {
  let s = await sourceModel.create({
    url: "Dummy url",
    lastChecked: new Date(),
    selectors: [],
    fetchModes: [],
    modifiers: [],
  });
  return newsModel.create({
    source: s._id,
    authors: [],
    title: "Dummy news",
    description: "Hello, World!",
    images: [],
    tags: [],
  });
}

async function dummyRemove() {
  await newsModel.deleteOne({ title: "Dummy news" });
  return sourceModel.deleteOne({ url: "Dummy url" });
}

describe("models", function () {
  it("should correctly insert", function (done) {
    dummyInsert()
      .then(() => {
        sourceModel
          .exists({ url: "Dummy url" })
          .then((dat) => {
            assert.notEqual(dat, null);
            newsModel
              .exists({ title: "Dummy news" })
              .then((dat2) => {
                assert.notEqual(dat2, null);
                done();
              })
              .catch((err2) => {
                done(err2);
              });
          })
          .catch((err) => {
            done(err);
          });
      })
      .catch((e) => done(e));
  });
  it("should correctly remove ", function (done) {
    dummyRemove()
      .then(() => {
        sourceModel
          .exists({ url: "Dummy url" })
          .then((dat) => {
            assert.equal(dat, null);
            newsModel
              .exists({ title: "Dummy news" })
              .then((dat2) => {
                assert.equal(dat2, null);
                done();
              })
              .catch((err2) => {
                done(err2);
              });
          })
          .catch((err) => {
            done(err);
          });
      })
      .catch((e) => done(e));
  });

  after(function () {
    mongoose.connection.close();
  });
});
