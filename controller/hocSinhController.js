const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class HocSinhController {
  constructor() {
    this.defaultFields =
      "Id, Name, Ma_Hoc_Sinh__c, NgayVaoTruong__c, DanToc__c, TonGiao__c, MaDinhDanh__c, NgaySinh__c, GioiTinh__c, Address__c";
  }
  getHocSinhByID = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM HocSinh__c WHERE Id = '${id}'`,
        (error, result) => {
          if (error) {
            returnResult.returnError(error, res);
          }
          delete result.records[0].attributes;
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };
}
module.exports = new HocSinhController();
