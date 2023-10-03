const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class NotificationController {
  constructor() {
    this.defaultFields =
      "Id, IsDeleted, Name, CreatedDate, Users__c, ExternalID__c, Type__c, IsSeen__c, Message__c";
  }
  getAllNotificationByUserID = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const {userId} = req.body;
      if(userId && userId !== ''){
        await salesforce.query(
          `SELECT ${this.defaultFields} FROM Notification__c WHERE Users__c = '${userId}'`,
          (error, result) => {
            if (error) {
              return;
            }
            if(result.totalSize) delete result.records[0].attributes; 
            returnResult.returnSuccess(result, res);
          }
        );
      } else {
        res.status(204).json({message: "Không có thông tin đầu vào"});
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };
}
module.exports = new NotificationController();
