const wsExpress = require("websocket-express");
const router = new wsExpress.Router();
const controller = require("./../controllers/newsController");

router.ws("/get", controller.getNewsAPI);

module.exports = router;
