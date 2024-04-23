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

const fileUtils = require("./../src/utils/fileUtils.js");
const newsUtils = require("./../src/utils/newsUtils.js");

async function dummySourceInsert() {
  return sourceModel.create({
    url: "Dummy url",
    lastChecked: new Date(),
    selectors: [],
    fetchModes: [],
    modifiers: [],
  });
}

async function dummyNewsInsert(source) {
  return newsModel.create({
    source: source._id,
    url: "Dummy news URL!",
    authors: [],
    title: "Dummy news",
    description: "Hello, World!",
    images: [],
    tags: [],
  });
}

async function dummySourceRemove() {
  return sourceModel.deleteOne({ url: "Dummy url" });
}

async function dummyNewsRemove() {
  await newsModel.deleteOne({ title: "Dummy news" });
}

async function dummyInsert() {
  let s = await dummySourceInsert();
  return dummyNewsInsert(s);
}

async function dummyRemove() {
  await dummyNewsRemove();
  return dummySourceRemove();
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

  it("should correctly remove", function (done) {
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

  it("should correctly register news with images", function (done) {
    dummySourceInsert()
      .then((s) => {
        newsUtils
          .registerNewsAsync(s._id, [], "Image dummy", "Hello, World!", [
            "https://img-9gag-fun.9cache.com/photo/a3Q5VW5_460s.jpg",
            "https://image.cnbcfm.com/api/v1/image/106964911-1635070875003-Xpeng_Flying_Car_.png",
          ])
          .then((dat) => {
            let imgExists = dat.images.map((i) => fileUtils.imageExistsSync(i));
            assert.equal(
              imgExists.every((o) => o == true),
              true
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      })
      .catch((e) => {
        done(e);
      });
  });

  it("should correctly remove images tied to news", function (done) {
    newsModel
      .findOne({ title: "Image dummy" })
      .then((news) => {
        let imgs = news.images;

        newsModel
          .deleteOne({ _id: news._id })
          .then(() => {
            dummySourceRemove()
              .then(() => {
                assert.equal(
                  imgs
                    .map((i) => fileUtils.imageExistsSync(i))
                    .every((b) => b == false),
                  true
                );
                done();
              })
              .catch((err3) => {
                done(err3);
              });
          })
          .catch((err2) => {
            done(err2);
          });
      })
      .catch((err) => {
        done(err);
      });
  });

  after(function () {
    mongoose.connection.close();
  });
});
