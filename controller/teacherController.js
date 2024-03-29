const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
class LessonController {
  constructor() {
    // SELECT Id, Name, MaGiaoVien__c, Users__c FROM Teacher__c
    // SELECT Id, Name, CreatedDate, UserName__c, Gender__c, Email__c, Phone__c, BirthDay__c, Password__c, LastModifiedDate FROM Users__c
    this.defaultFields =
      "Id, Name, MaGiaoVien__c, Users__c";
  }

  getAllTeacher = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      var rs = [];
      var listUserId = [];
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Teacher__c`,
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
              console.log(tmp);
            });
          }
        );
      }
      returnResult.returnSuccess(rs, res);
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  getAllTeacherById = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      var rs = [];
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Teacher__c WHERE Id = '${id}'`,
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

  createTeacher = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      let teacher = {...req.body};
      if(teacher?.Password__c){
        var encryptedPassword = await bcrypt.hash(teacher.Password__c, 10);
        teacher.Password__c = encryptedPassword;
      }
      if(teacher.Id) {
        const id = teacher.Id;
        teacher.Id = teacher.IdUser;
        delete teacher.IdUser;
        const newTeacherCreate = await salesforce
        .sobject("Users__c")
        .update(teacher, function (err, ret) {
          if (err) {
            return { error: err };
          }
        });
        if (newTeacherCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newTeacherCreate.error);
        if(teacher?.UserName__c){
          const newTeacherCreate02 = await salesforce
          .sobject("Teacher__c")
          .update({Id : id, Name: teacher.UserName__c}, function (err, ret) {
            if (err) {
              return { error: err };
            }
          });
          if (newTeacherCreate02?.error)
          return res
            .status(500)
            .send("Internal Server Error: " + newTeacherCreate02.error);
        }
      } else {
        const newUser = await salesforce
        .sobject("Users__c")
        .create(teacher, function (err, ret) {
          if (err) {
            return { error: err };
          }
          teacher.Id = ret.id;
        });
        if (newUser?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newUser.error);

        let userRole = { 
          Role__c : 'a035j00000Tf08IAAR', 
          Users__c : teacher.Id
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

        const newTeacherCreate = await salesforce
        .sobject("Teacher__c")
        .create({Name: teacher.UserName__c, Users__c: teacher.Id}, function (err, ret) {
          if (err) {
            return { error: err };
          }
          teacher = {
            User: {...teacher},
            Name: teacher.UserName__c,
            Users__c: teacher.Id,
            Id: ret.id
          };
        });
        if (newTeacherCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newTeacherCreate.error);
      }
      res.json(teacher);
    } catch (err) {
      console.log(err);
      return res.status(500).send("error: " + err.errorCode);
    }
  };
}
module.exports = new LessonController();