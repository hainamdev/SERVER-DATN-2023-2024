const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class LessonController {
  constructor() {
    // SELECT Id, Name, CreatedDate, LastModifiedDate, ClassHeader__c, Date__c, Status__c FROM AttendanceDay__c
    this.defaultFields =
      "Id, Name, CreatedDate, LastModifiedDate, ClassHeader__c, Date__c, Status__c, SL_DI_HOC__c,SL_PHEP__c, SL_KHONG_PHEP__c";
  }

  getAllAttendanceDayById = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM AttendanceDay__c WHERE ClassHeader__c = '${id}'`,
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

  createAttendanceDay = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      let attendanceDay = {...req.body};
      if(attendanceDay.Student && attendanceDay.Student.length){
        const data = JSON.parse(JSON.stringify(attendanceDay));
        delete data.Student;
        const newAttendanceDayCreate = await salesforce
          .sobject("AttendanceDay__c")
          .create(data, function (err, ret) {
            if (err) {
              return { error: err };
            }
            attendanceDay.Id = ret.id;
          });
        if (newAttendanceDayCreate?.error)
          return res
            .status(500)
            .send("Internal Server Error: " + newAttendanceDayCreate.error);
        console.log(newAttendanceDayCreate);

        attendanceDay.Student.forEach((item) => {
          item.AttendanceDay__c = attendanceDay.Id;
        });

        const newAttendanceLineCreate = await salesforce
          .sobject("AttendanceLine__c")
          .create(attendanceDay.Student, function (err, rets) {
            if (err) {
              return { error: err };
            }
            attendanceDay.Student.forEach((item, index) => {
              item.Id = rets[index].id;
            });
          });
        if (newAttendanceLineCreate?.error)
          return res
            .status(500)
            .send("Internal Server Error: " + newAttendanceLineCreate.error);
        console.log(newAttendanceLineCreate);

        res.json(attendanceDay);
      } else {
        return res
        .status(500)
        .send("NO_STUDENT");
      }
    } catch (err) {
      console.log(err);
      return res
      .status(500)
      .send("Internal Server Error: " + err);
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
