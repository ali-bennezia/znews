const newsUtils = require("./../utils/newsUtils");
const sanitationUtils = require("./../utils/sanitationUtils");
const apiUtils = require("./../utils/apiUtils");

// To-client types: putNewsPayload, patchNewsPayload
// To-server types: query
exports.getNewsAPI = async (req, res) => {
  try {
    const ws = await res.accept();
    apiUtils.registerClientSync(ws);
    ws.on("message", async function (msg) {
      try {
        let msgObj = JSON.parse(String(msg));
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

      //ws.close();
    });

    ws.on("close", function (msg) {
      apiUtils.unregisterClientSync(ws);
    });
    ws.on("error", function (msg) {
      apiUtils.unregisterClientSync(ws);
    });
  } catch (apiErr) {
    console.error(apiErr);
  }
};
