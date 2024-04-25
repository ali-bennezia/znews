const newsUtils = require("./../utils/newsUtils");
const sanitationUtils = require("./../utils/sanitationUtils");

exports.getNewsAPI = async (req, res) => {
  const ws = await res.accept();
  ws.on("message", async function (msg) {
    let optsStr = String(msg);
    let opts = optsStr == "" || !optsStr ? undefined : JSON.parse(optsStr);
    const news = await newsUtils.getNewsAsync(opts);

    let answer = {
      type: "newsPayload",
      content: await sanitationUtils.formatNewsArrayAsync(news),
    };

    ws.send(JSON.stringify(answer));
    ws.close();
  });
};
