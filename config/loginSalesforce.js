const jsforce = require("jsforce");
const ultilLogMessage = require("../utils/ultilLogMessage");

class SalesforceConnection {
  constructor() {
    this.conn = null;
    this.setupConnection();
  }

  async setupConnection() {
    this.conn = new jsforce.Connection();
    const username = process.env.SALEFORCE_ACCOUNT_NAME;
    const password = process.env.SALEFORCE_ACCOUNT_PASSWORD;
    const token = process.env.SALEFORCE_ACCOUNT_TOKEN;
    const api_version = process.env.SALEFORCE_ACCOUNT_VERSION;
    this.conn.version = api_version;
    await this.conn.login(username, password + token, function (err, res) {
      if (err) {
        ultilLogMessage.consoleLogBoxMessage(err);
      } else {
        ultilLogMessage.consoleLogBoxMessage(
          "Succcessfully logged into Salesforce"
        );
      }
    });
  }

  
  async getConnection() {
    this.conn = null;
    if (!this.conn?.accessToken) { 
      ultilLogMessage.consoleLogBoxMessage("Processing.......");
      await this.setupConnection();
      ultilLogMessage.consoleLogBoxMessage("Complete Login");
      return this.conn;
    } else {
      try {
        await this.conn.identity();
        return this.conn;
      } catch (error) {
        ultilLogMessage.consoleLogBoxMessage("Processing.......");
        await this.setupConnection();
        ultilLogMessage.consoleLogBoxMessage("Complete Login");
        return this.conn;
      }
    }
  }
}

module.exports = new SalesforceConnection();
