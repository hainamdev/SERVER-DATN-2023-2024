const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class LetterController {
    //SELECT Id, Name, CreatedDate, LastModifiedDate, HocSinh__c, ClassHeader__c, NgayNop__c, NgayNghi__c, SoNgayNghi__c, TrangThai__c, LyDo__c FROM School_Leave_Letter__c
  constructor() {
    this.defaultFields = "Id, Name, CreatedDate, LastModifiedDate, HocSinh__c, ClassHeader__c, NgayNop__c, NgayNghi__c, SoNgayNghi__c, TrangThai__c, LyDo__c";
  }

  getLetterByIDLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM School_Leave_Letter__c WHERE ClassHeader__c = '${id}' AND TrangThai__c != 'DELETE'`,
        (error, result) => {
          if (error) return error;
          result.records.forEach((ls) => {
            delete ls.attributes;
          });
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      // returnResult.returnError(error, res);
      res.status(500).json(error);
    }
  };

  getLetterByIDHocSinh = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM School_Leave_Letter__c WHERE HocSinh__c = '${id}'`,
        (error, result) => {
          if (error) return error;
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

  saveLetter = async (req, res) => {
    const salesforce = await SalesforceConnection.getConnection();
    let letter = {...req.body};
    console.log(letter);
    if(letter.Id){
      const idNewLetter = await salesforce.sobject("School_Leave_Letter__c").create(letter, function (err, ret) {
        if (err || !ret.success) {
          return { error: err };
        }
        return ret.id;
      });
      if (idNewLetter?.error)
        return res.status(500).send("Internal Server Error: " + idNewLetter.error);
      letter.Id = idNewLetter.id;
    } else {
      await salesforce.sobject("School_Leave_Letter__c").update(letter, function (err, ret) {
        if (err || !ret.success) {
          return res.status(500).send("Internal Server Error: " + err);
        }
      });
    }
    res.json(letter);
  };
}
module.exports = new LetterController();
