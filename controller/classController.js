const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const salesforce = require("../config/loginSalesforce").getConnection();
const returnResult = require("../utils/utilReturnData");
class ClassController {
  constructor() {
  }

  getHocSinhByIDLop = async (req, res) => {
    try {
      const id = req.params.id;
      let listHocSinh = [];
      let rs = [];
      await salesforce.query(
        `SELECT HocSinh__c FROM ClassLine__c WHERE ClassHeader__c = '${id}'`,
        (error, result) => {
          if (error) return rs;
          rs = result.records.map((item) => {
            return item.HocSinh__c;
          });
        }
      );

      if (rs.length) {
        let tmp = "'" + rs.join("','") + "'";
        listHocSinh = await salesforce.query(
          `SELECT Id, Name FROM HocSinh__c WHERE Id IN (${tmp})`,
          (error, result) => {
            if (error) return [];
            result.records.forEach((hs) => {
              delete hs.attributes;
            });
            return result.records;
          }
        );
      }

      await salesforce.query(
        `SELECT Id, Name, GiaoVien__c, NumOfStudent__c, Status__c FROM ClassHeader__c WHERE Id = '${id}'`,
        (error, result) => {
          if (error) {
            returnResult.returnError(error, res);
          }
          delete result.records[0].attributes;
          result.records[0] = {
            ...result.records[0],
            Student: [...listHocSinh],
          };
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };
}
module.exports = new ClassController();
