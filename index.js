const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const ultilLogMessage = require('./utils/ultilLogMessage');

const { API_PORT } = process.env;
const port = process.env.PORT || 8080;
// server listening 
server.listen(port, () => {
  ultilLogMessage.consoleLogBoxMessage("Server run on port: " + port);
});
