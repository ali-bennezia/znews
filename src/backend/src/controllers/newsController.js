const newsUtils = require("./../utils/newsUtils");
const sanitationUtils = require("./../utils/sanitationUtils");
const apiUtils = require("./../utils/apiUtils");

// To-client types: newsPayload, freshNewsCount
// To-server types: query
exports.getNewsAPI = async (req, res) => {
  try {
    const ws = await res.accept();
    ws.on("message", async function (msg) {
      try {
        let msgObj = JSON.parse(String(msg));
        console.log(msgObj);
        if (
          !sanitationUtils.objectHasAllPropertiesSync(msgObj, [
            "type",
            "content",
          ])
        ) {
          ws.send(
            apiUtils.makeAPIMessageSync(
              "error",
              "Message is missing properties."
            )
          );
          return;
        }

        switch (msgObj.type) {
          case "query":
            await apiUtils.handleQueryRequestAsync(ws, msgObj);
            break;
          default:
            ws.send(
              apiUtils.makeAPIMessageSync(
                "error",
                "Message is of unknown type."
              )
            );
            break;
        }
      } catch (err) {
        console.error(err);
        ws.send(
          apiUtils.makeAPIMessageSync(
            "error",
            "Error processing received message."
          )
        );
      }

      ws.on("close", function (msg) {});
      ws.on("error", function (msg) {});

      //ws.close();
    });
  } catch (apiErr) {
    console.error(apiErr);
  }
};
