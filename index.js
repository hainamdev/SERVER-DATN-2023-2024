require("dotenv").config();
const express = require("express");
const ultilLogMessage = require('./utils/ultilLogMessage');
const usersController = require('./controller/usersController');
const bodyParser = require("body-parser");
const deployToWeb = process.env.deployToWeb || true;
const port = process.env.PORT || 8080;
const app = express();

if (deployToWeb) {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/", function (req, res) {
    res.json({ status: "online" });
  });

  // const paramValue = req.query.param  /route?param=value
  // app.get("/:id", function (req, res) { const id = req.params.id;

  // lấy tất cả  account
  app.get("/users",usersController.getAllUser);
  // lấy account bằng Id
  app.get("/user/:id",usersController.getUserbyId);

  // app.post("/email/confirm/", function (req, res) {
  //   try {
  //     var body = req.body;
  //     conn.apex.post("/email/confirm/", body, function (err, response) {
  //       if (err || response === "ERROR" || response === "FAIL") {
  //         res.json({ status: "FAIL" });
  //       } else {
  //         res.json({ status: "SUCCESS" });
  //       }
  //     });
  //   } catch (error) {
  //     res.json({ status: "FAIL" });
  //   }
  // });

  //setup actual server
  app.listen(port, function () {
    ultilLogMessage.consoleLogBoxMessage("Server run on port: " + port);
  });
}
