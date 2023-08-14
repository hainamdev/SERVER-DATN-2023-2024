const http = require("http");
const app = require("./app");
// const cors = require('cors');
const server = http.createServer(app);
const ultilLogMessage = require('./utils/ultilLogMessage');

const { API_PORT } = process.env;
const port = process.env.PORT || 8080;

// const allowedOrigins = ['http://localhost:3000'];

// Config CORS
// app.use(cors({
//   origin: allowedOrigins,
//   methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
//   allowedHeaders: '*',
//   exposedHeaders: '*',
//   credentials: true,
//   maxAge: 86400,
//   optionsSuccessStatus: 204,
// }));

// server listening 
server.listen(port, () => {
  ultilLogMessage.consoleLogBoxMessage("Server run on port: " + port);
});
