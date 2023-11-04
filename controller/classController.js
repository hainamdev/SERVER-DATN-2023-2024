const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class ClassController {

  constructor() {
    this.defaultFields = "Id, Name, GiaoVien__c, NumOfStudent__c, Status__c, SchoolYear__c, CreatedDate, LastModifiedDate";
  }

  getHocSinhByIDLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      if(!id) return res.status(500).send("Data request is nothing");
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
          `SELECT Id, Ma_Hoc_Sinh__c, Name, NgaySinh__c, GioiTinh__c FROM HocSinh__c WHERE Id IN (${tmp})`,
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
            // returnResult.returnError(error, res);
            return;
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
      // returnResult.returnError(error, res);
      res.status(500).json(error);
    }
  };

  getAllLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const year = req.query.year;
      console.log(year);
      let query02 = (year && year !== '') ? `WHERE SchoolYear__c = ${year}` : '';
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM ClassHeader__c ${query02}`,
        (error, result) => {
          if (error) return;
          result.records.forEach((ls) => {
            delete ls.attributes;
          });
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  };

}
module.exports = new ClassController();
