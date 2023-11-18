const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class LessonController {
  constructor() {
    // SELECT Id, Name, MaGiaoVien__c, Users__c FROM Teacher__c
    this.defaultFields =
      "Id, Name, MaGiaoVien__c, Users__c";
  }

  getAllTeacher = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Teacher__c`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach((ls) => {
            delete ls.attributes;
          });
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  // getAllLessonByIdLop = async (req, res) => {
  //   try {
  //     const salesforce = await SalesforceConnection.getConnection();
  //     const idLop = req.params.idLop;
  //     await salesforce.query(
  //       `SELECT ${this.defaultFields} FROM Lesson__c WHERE Class__c = '${idLop}' ORDER BY LastModifiedDate DESC`,
  //       (error, result) => {
  //         if (error) {
  //           // returnResult.returnError(error, res);
  //           return;
  //         }
  //         result.records.forEach((ls) => {
  //           delete ls.attributes;
  //         });
  //         returnResult.returnSuccess(result, res);
  //       }
  //     );
  //   } catch (error) {
  //     returnResult.returnError(error, res);
  //   }
  // };

  // deleteLesson = async (req, res) => {
  //   try {
  //     const salesforce = await SalesforceConnection.getConnection();
  //     const { id } = req.body;
  //     salesforce.sobject("Lesson__c").destroy(id, function (err, ret) {
  //       if (err || !ret.success) {
  //         // return res.status(500).send("Internal Server Error: " + err);
  //         return;
  //       }
  //       return res.status(200).send("Success");
  //     });
  //   } catch (error) {
  //     returnResult.returnError(error, res);
  //   }
  // };

  createTeacher = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      let teacher = {...req.body};
      const newTeacherCreate = await salesforce
        .sobject("Teacher__c")
        .create(teacher, function (err, ret) {
          if (err) {
            return { error: err };
          }
          teacher.Id = ret.id;
        });
      if (newTeacherCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newTeacherCreate.error);
      console.log(newTeacherCreate);
      res.json(teacher);
    } catch (err) {
      console.log(err);
    }
  };
  // getLessonWeek = async (req, res) => {
  //   try {
  //     const salesforce = await SalesforceConnection.getConnection();
  //     const data = req.body;
  //     console.log(data);
  //     let resData;
  //     await salesforce.apex.post("/lesson/get/", data,function (err, ret) {
  //         if (err) {
  //           console.log(err);
  //           // return res.status(500).send("Internal Server Error: " + err);
  //           return res.status(200).json({
  //             status: 500,
  //             error: err,
  //           });
  //         }
  //         resData = ret;
  //       }
  //     );
  //     return res.status(200).json({
  //       status: 200,
  //       data: resData,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
}
module.exports = new LessonController();
