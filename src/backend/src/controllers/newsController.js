const newsUtils = require("./../utils/newsUtils");

exports.getNewsAPI = async (req, res) => {
  const ws = await res.accept();
  ws.on("message", async function (msg) {
    const news = await newsUtils.getNewsAsync();

    ws.send(JSON.stringify(news));
    //ws.send("Hello, World!");
    ws.close();
  });
};
