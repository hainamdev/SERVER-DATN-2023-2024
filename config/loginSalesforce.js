const jsforce = require("jsforce");
const ultilLogMessage = require('../utils/ultilLogMessage');

class SalesforceConnection {
  constructor() {
    this.accessToken = null;
    this.instanceUrl = null;
    this.setupConnection();
  }

  setupConnection() {
    if (!this.accessToken || !this.instanceUrl) {
      var conn = new jsforce.Connection();
      let accessTokenLogin;
      let instanceUrlLogin;
      const username = process.env.SALEFORCE_ACCOUNT_NAME;
      const password = process.env.SALEFORCE_ACCOUNT_PASSWORD;
      const token = process.env.SALEFORCE_ACCOUNT_TOKEN;
      const production = process.env.SALEFORCE_ACCOUNT_PRODUCTION;
      const api_version = process.env.SALEFORCE_ACCOUNT_VERSION;
      if (!production) {
        this.conn.loginUrl = "https://test.salesforce.com";
      }
      if (username && password && token) {
        conn.version = api_version;
        conn.login(username, password + token, function (err, res) {
          if (err) {
            console.error(err);
          } else {
            accessTokenLogin = conn.accessToken;
            instanceUrlLogin = conn.instanceUrl;
            ultilLogMessage.consoleLogBoxMessage("Succcessfully logged into Salesforce");
          }
        });
        this.accessToken = accessTokenLogin;
        this.instanceUrl = instanceUrlLogin;
        return conn;
      } else {
        console.log("Username and password not setup.");
      }
    }
  }

  getConnection() {
    try {
      if (!this.accessToken || !this.instanceUrl) {
        return this.setupConnection();
      }
      let conn = new jsforce.Connection({
        instanceUrl : this.instanceUrl,
        accessToken : this.accessToken
      });
      return conn;
    } catch (error) {
      this.accessToken = null;
      this.instanceUrl = null;
      return this.setupConnection();
    }
  }
}

module.exports = new SalesforceConnection();

