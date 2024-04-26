const newsUtils = require("./newsUtils");
const sanitationUtils = require("./sanitationUtils");

function makeAPIMessageSync(messageType, messageContent) {
  return JSON.stringify({ type: messageType, content: messageContent });
}
exports.makeAPIMessageSync = makeAPIMessageSync;

async function handleQueryRequestAsync(ws, msg) {
  let opts = msg.content;

  let cl = getClientSync(ws);
  cl.lastQuery = opts;

  await sendWebSocketNewsAsync(ws, opts);
}
exports.handleQueryRequestAsync = handleQueryRequestAsync;

async function sendWebSocketNewsAsync(ws, qry) {
  const news = await newsUtils.getNewsAsync(qry);
  ws.send(
    makeAPIMessageSync(
      "newsPayload",
      await sanitationUtils.formatNewsArrayAsync(news)
    )
  );
}

/*
  client: {
    socket: ...,
    lastQuery: ...
  }
*/
var clients = [];
function registerClientSync(webSocket) {
  clients.push({ socket: webSocket, lastQuery: {} });
}
exports.registerClientSync = registerClientSync;

function unregisterClientSync(webSocket) {
  clients = clients.filter((el) => el.socket != webSocket);
}
exports.unregisterClientSync = unregisterClientSync;

function getClientSync(webSocket) {
  return clients.find((el) => el.socket == webSocket) ?? null;
}
exports.getClientSync = getClientSync;

function sendClientsLastNews() {
  for (let c of clients) {
    sendWebSocketNewsAsync(c.socket, c.lastQuery);
  }
}
exports.sendClientsLastNews = sendClientsLastNews;
