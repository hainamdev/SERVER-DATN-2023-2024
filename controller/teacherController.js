const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
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
      if(teacher.Id) {
        const newTeacherCreate = await salesforce
        .sobject("Teacher__c")
        .update(teacher, function (err, ret) {
          if (err) {
            return { error: err };
          }
        });
        if (newTeacherCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newTeacherCreate.error);
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
      return res.status(500).send("error: " + err.errorCode);
    }
  };
}
module.exports = new LessonController();