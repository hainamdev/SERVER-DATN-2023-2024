const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
class ParentController {
  constructor() {
    // SELECT Id, Name, MaGiaoVien__c, Users__c FROM Teacher__c
    // SELECT Id, Name, CreatedDate, UserName__c, Gender__c, Email__c, Phone__c, BirthDay__c, Password__c, LastModifiedDate FROM Users__c
    this.defaultFields =
      "Id, Name, Type__c , Users__c";
  }

  getAllParent = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      var rs = [];
      var listUserId = [];
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Parent__c`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach(async (ls) => {
            delete ls.attributes;
            listUserId.push(ls.Users__c);
          });
          rs = result;
        }
      );
      if(rs.totalSize > 0){
        await salesforce.query(
          `SELECT Id, Name, CreatedDate, UserName__c, Gender__c, Email__c, Phone__c, BirthDay__c, Password__c, LastModifiedDate FROM Users__c WHERE Id IN ('${listUserId.join("', '")}')`,
          (error, result) => {
            if (error) {
              return;
            }
            result.records.forEach((us) => {
              delete us.attributes;
              var tmp = rs.records.find((item) => item.Users__c === us.Id);
              tmp.User = {
                ...us
              }
            });
          }
        );
      }
      returnResult.returnSuccess(rs, res);
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  getParentById = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      var rs = [];
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Parent__c WHERE Id = '${id}'`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach(async (ls) => {
            delete ls.attributes;
          });
          rs = result;
        }
      );
      if(rs.totalSize > 0){
        await salesforce.query(
          `SELECT Id, Name, CreatedDate, UserName__c, Gender__c, Email__c, Phone__c, BirthDay__c, Password__c, LastModifiedDate FROM Users__c WHERE Id = '${rs.records[0].Users__c}'`,
          (error, result) => {
            if (error) {
              return;
            }
            result.records.forEach((us) => {
              delete us.attributes;
              rs.records[0].User = {
                ...us
              }
            });
          }
        );
      }
      returnResult.returnSuccess(rs, res);
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  createParent = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      let parent = {...req.body};
      const type = parent?.Type__c;
      if(type){
        delete parent.Type__c;
      }
      if(parent?.Password__c){
        var encryptedPassword = await bcrypt.hash(parent.Password__c, 10);
        parent.Password__c = encryptedPassword;
      }
      if(parent.Id) {
        const id = parent.Id;
        parent.Id = parent.IdUser;
        delete parent.IdUser;
        const newparentCreate = await salesforce
        .sobject("Users__c")
        .update(parent, function (err, ret) {
          if (err) {
            return { error: err };
          }
        });
        if (newparentCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newparentCreate.error);

        if(parent?.UserName__c || parent?.Type__c){
          var obj = {
            Id : id
          };
          if(parent?.UserName__c){
            obj.Name = parent.UserName__c;
          }
          if(parent?.Type__c){
            obj.Type__c = parent?.Type__c;
          }
          console.log(obj);
          const newparentCreate02 = await salesforce
          .sobject("Parent__c")
          .update(obj, function (err, ret) {
            if (err) {
              return { error: err };
            }
          });
          if (newparentCreate02?.error)
          return res
            .status(500)
            .send("Internal Server Error: " + newparentCreate02.error);
        }
      } else {
        const newUser = await salesforce
        .sobject("Users__c")
        .create(parent, function (err, ret) {
          if (err) {
            return { error: err };
          }
          parent.Id = ret.id;
        });
        if (newUser?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newUser.error);

        let userRole = { 
          Role__c : 'a035j00000Tf08NAAR', 
          Users__c : parent.Id
        };

        const roleCreate = await salesforce
        .sobject("UserRole__c")
        .create(userRole, function (err, ret) {
          if (err) {
            return { error: err };
          }
          return ret.id;
        });
        if (roleCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + roleCreate.error);

        const newParentCreate = await salesforce
        .sobject("Parent__c")
        .create({Name: parent.UserName__c, Users__c: parent.Id, Type__c: type}, function (err, ret) {
          if (err) {
            return { error: err };
          }
          parent = {
            User: {...parent},
            Name: parent.UserName__c,
            Users__c: parent.Id,
            Id: ret.id
          };
        });
        if (newParentCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newParentCreate.error);
      }
      res.json(parent);
    } catch (err) {
      return res.status(500).send("error: " + err.errorCode);
    }
  };
}
module.exports = new ParentController();