const newsUtils = require("./newsUtils");
const sanitationUtils = require("./sanitationUtils");

function makeAPIMessageSync(messageType, messageContent) {
  return JSON.stringify({ type: messageType, content: messageContent });
}
exports.makeAPIMessageSync = makeAPIMessageSync;

async function handleQueryRequestAsync(ws, msg) {
  let opts = msg.content;
  const news = await newsUtils.getNewsAsync(opts);

  ws.send(
    makeAPIMessageSync(
      "newsPayload",
      await sanitationUtils.formatNewsArrayAsync(news)
    )
  );
}
exports.handleQueryRequestAsync = handleQueryRequestAsync;
