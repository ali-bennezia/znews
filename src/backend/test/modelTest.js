const initialization = require("./../src/initialization.js");
const mongoose = require("mongoose");

initialization.initialize();
const backEndCfg = initialization.getConfig("backend");

mongoose
  .connect(backEndCfg.testDatabaseUrl)
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
const dataUtils = require("./../src/utils/dataUtils.js");

async function dummySourceInsert() {
  return sourceModel.create({
    name: "Dummy source",
    identifier: "dummysource",
    url: "Dummy url",
    country: "fr",
    tags: ["Misc", "Science & Technology"],

    sourceType: "api%get",
    lastChecked: new Date(),
    newsPointer: "json%news",
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

async function dummyAPISourceInsertAndFetch() {
  let s = await newsUtils.tryRegisterSourceAsync(
    "News API",
    "newsapi",
    "https://newsapi.org/v2/top-headlines?country=fr",
    "fr",
    ["Recent events", "Misc"],
    "api%get",
    "json%articles",
    [
      "json%author",
      "json%title",
      "json%description",
      "json%url",
      "json%urlToImage",
    ],
    ["authors", "title", "description", "url", "images"],
    ["wrapInArray", "emptyIfNull", "emptyIfNull", "emptyIfNull", "wrapInArray"]
  );
  return dataUtils.fetchSourceNewsAsync(s._id);
}

async function dummyPageSourceInsertAndFetch() {
  let s = await newsUtils.tryRegisterSourceAsync(
    "Sky News",
    "skynews",
    "https://news.sky.com/",
    "uk",
    ["Recent events", "Misc"],
    "page",
    "page%div.ui-story-wrap",
    [
      "none-array",
      "dom-content%div.ui-story-headline > a",
      "none",
      "dom-attrib%div.ui-story-headline > a%href",
      "dom-attrib%img.ui-story-image%src",
    ],
    ["authors", "title", "description", "url", "images"],
    ["none", "emptyIfNull", "emptyIfNull", "emptyIfNull", "wrapInArray"]
  );
  return await dataUtils.fetchSourceNewsAsync(s._id);
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
  before(function (done) {
    fileUtils.setImageStorageFileName(
      initialization.getConfig("backend").testImageStorage
    );
    newsUtils
      .clearSourceAndNewsAsync()
      .then(() => done())
      .catch((e) => done(e));
  });

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
          .tryRegisterNewsAsync(
            s._id,
            "http://my-news.org",
            [],
            "Image dummy",
            "Hello, World!",
            [
              "https://img-9gag-fun.9cache.com/photo/a3Q5VW5_460s.jpg",
              "https://image.cnbcfm.com/api/v1/image/106964911-1635070875003-Xpeng_Flying_Car_.png",
            ]
          )
          .then((dat) => {
            let imgExists = dat.images
              ? dat.images.map((i) => fileUtils.imageExistsSync(i))
              : [];
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
                    ? imgs
                        .map((i) => fileUtils.imageExistsSync(i))
                        .every((b) => b == false)
                    : true,
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

  describe("API and page sources", function () {
    beforeEach(function (done) {
      newsUtils
        .clearSourceAndNewsAsync()
        .then(() => done())
        .catch((e) => done(e));
    });

    it("should create API news source, and correctly fetch its data", function (done) {
      dummyAPISourceInsertAndFetch()
        .then(() => {
          newsModel
            .countDocuments({})
            .then((c) => {
              assert.equal(c > 0, true);
              done();
            })
            .catch((err2) => done(err2));
        })
        .catch((err) => done(err));
    });

    it("should create page news source, and correctly fetch its data", function (done) {
      dummyPageSourceInsertAndFetch()
        .then(() => {
          newsModel
            .countDocuments({})
            .then((c) => {
              assert.equal(c > 0, true);
              done();
            })
            .catch((err2) => done(err2));
        })
        .catch((err) => done(err));
    });
  });

  after(function (done) {
    newsUtils
      .clearSourceAndNewsAsync()
      .then(() => {
        mongoose.connection.close();
        done();
      })
      .catch((e) => done(e));
  });
});
