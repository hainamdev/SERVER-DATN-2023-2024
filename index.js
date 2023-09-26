const app = require("./app");
const server = require("http").Server(app);
const ultilLogMessage = require("./utils/ultilLogMessage");
const socketApi = require('./Socket')
const port = process.env.PORT || 8080;

socketApi.io.attach(server);

// server listening
server.listen(port, () => {
  ultilLogMessage.consoleLogBoxMessage("Server run on port: " + port);
});

