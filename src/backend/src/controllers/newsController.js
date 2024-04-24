exports.getNews = async (req, res) => {
  const ws = await res.accept();
  ws.on("message", function (msg) {
    ws.send("Hello, World!");
    ws.close();
  });
};
