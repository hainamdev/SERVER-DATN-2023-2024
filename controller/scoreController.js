const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class ScoreController {
  constructor() {
    // this.defaultFields =
    //   "Id, Name, CreatedDate, LastModifiedDate, Status__c, SentDay__c, 	SendTime__c, SendMinute__c, IsAutoSent__c, Content__c, Title__c";
  }

  createImportScore = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const data = req.body;
      console.log(data);
      await salesforce.apex.post("/score/import/", data,function (err, ret) {
          if (err) {
            return res.status(500).send("Internal Server Error: " + err);
          }
        }
      );
      return res.status(200).json({
        status: 200,
        data: 'ok',
      });
    } catch (err) {
      console.log(err);
    }
  };

  getAllScore = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const data = req.body;
      console.log(data);
      let resData;
      await salesforce.apex.post("/score/get-all-class/", data,function (err, ret) {
          if (err) {
            return res.status(500).send("Internal Server Error: " + err);
          }
          resData = ret;
        }
      );
      return res.status(200).json({
        status: 200,
        data: resData,
      });
    } catch (err) {
      console.log(err);
    }
  };
}
module.exports = new ScoreController();
