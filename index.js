require("dotenv").config();
var jsforce = require("jsforce");
var path = require("path");
var bodyParser = require("body-parser");
var configpath = path.normalize("./");
var config = require(configpath + "config.js");
var conn = new jsforce.Connection();
var loggedIn = false;

//For username / password flow
var username = process.env.SALEFORCE_ACCOUNT_NAME || "namn81444@gmail.com";
var password = process.env.SALEFORCE_ACCOUNT_PASSWORD || "Hainamh@123";
var token = process.env.SALEFORCE_ACCOUNT_TOKEN || "HwhADCGml3IZDGikDo9nFXyFI";
var production = process.env.SALEFORCE_ACCOUNT_PRODUCTION || true;
var api_version = process.env.SALEFORCE_ACCOUNT_VERSION || "57.0";
var deployToWeb = process.env.deployToWeb || true;

if (deployToWeb) {
  var port = process.env.PORT || 8080;
  var express = require("express");
  var app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/", function (req, res) {
    res.json({ status: "online" });
  });

  app.get("/contacts/", function (req, res) {
    conn.query(
      "SELECT Id, Name, FIELDS(CUSTOM) FROM Contact limit 200",
      function (err, result) {
        if (err) {
          res.json(err);
        }
        res.json(result);
      }
    );
  });

  app.post("/email/confirm/", function (req, res) {
    try {
      var body = req.body;
      conn.apex.post("/email/confirm/", body, function (err, response) {
        if (err || response === "ERROR" || response === "FAIL") {
          res.json({ status: "FAIL" });
        } else {
          res.json({ status: "SUCCESS" });
        }
      });
    } catch (error) {
      res.json({ status: "FAIL" });
    }
  });

  //setup actual server
  app.listen(port, function () {
    consoleLogBoxMessage("Server run on port: " + port);
  });
}

//Log in using username and password, set loggedIn to true and handle a callback
//
function login(callback) {
  if (!production) {
    conn.loginUrl = "https://test.salesforce.com";
  }
  if (username && password && token) {
    conn.version = api_version;
    conn.login(username, password + token, function (err, res) {
      if (err) {
        return console.error(err);
      } else {
        loggedIn = true;
        consoleLogBoxMessage("Succcessfully logged into Salesforce");
        if (callback) {
          callback();
        }
      }
    });
  } else {
    console.log("Username and password not setup.");
  }
}

var callback = null;
function consoleLogMessage(mess) {
  var odd = mess.length % 2;
  var len = 50;
  var str = mess.length ? " " + mess + " " : "**";
  for (var i = 1; i < len - mess.length / 2; i++) str = "*" + str;
  if (odd) str += " ";
  for (var i = 1; i < len - mess.length / 2; i++) str += "*";
  console.log(str);
}

function consoleLogBoxMessage(mess) {
  consoleLogMessage("");
  consoleLogMessage(mess);
  consoleLogMessage("");
}

login(callback);
