const wsExpress = require("websocket-express");
const router = new wsExpress.Router();
const controller = require("./../controllers/newsController");

router.ws("/echo", controller.getNews);

module.exports = router;
