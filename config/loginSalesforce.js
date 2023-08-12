const jsforce = require("jsforce");
const ultilLogMessage = require('../utils/ultilLogMessage');

class SalesforceConnection {
  constructor() {
    this.conn = null;
    this.setupConnection();
  }

  setupConnection() {
    if (!this.conn) {
      this.conn = new jsforce.Connection();
      const username = process.env.SALEFORCE_ACCOUNT_NAME;
      const password = process.env.SALEFORCE_ACCOUNT_PASSWORD;
      const token = process.env.SALEFORCE_ACCOUNT_TOKEN;
      const production = process.env.SALEFORCE_ACCOUNT_PRODUCTION;
      const api_version = process.env.SALEFORCE_ACCOUNT_VERSION;
      if (!production) {
        this.conn.loginUrl = "https://test.salesforce.com";
      }
      if (username && password && token) {
        this.conn.version = api_version;
        this.conn.login(username, password + token, function (err, res) {
          if (err) {
            return console.error(err);
          } else {
            ultilLogMessage.consoleLogBoxMessage("Succcessfully logged into Salesforce");
          }
        });
      } else {
        console.log("Username and password not setup.");
      }
    }
  }

  getConnection() {
    return this.conn;
  }
}

module.exports = new SalesforceConnection();

