  const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class ScheduleController {
  constructor() {

    // SELECT Id, Name, CreatedDate, LastModifiedDate, Title__c, EndDate__c, StartDate__c, Status__c, ClassHeader__c FROM Schedule__c
    // SELECT Id, Name, CreatedDate, LastModifiedDate, Schedule__c, Subject__c, Lesson__c, Day__c FROM ScheduleSubject__c
    this.defaultFields = "Id, Name, CreatedDate, LastModifiedDate, Title__c, EndDate__c, StartDate__c, Status__c, ClassHeader__c";
    this.defaultFieldsScheduleSubject = "Id, Name, CreatedDate, LastModifiedDate, Schedule__c, Subject__c, Lesson__c, Day__c";
  }

  getScheduleByIdClass = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const idClass = req.query.idClass;
      const day = req.query.day;
      const date = req.query.date;
      console.log(date);
      var resultData = {
        status : 200,
        Schedule: {}
      }
      let query02 = 'AND StartDate__c <= TODAY AND EndDate__c >= TODAY';
      if(date && date !== ''){
        query02 = `AND StartDate__c <= ${date} AND EndDate__c >= ${date}`;
      }
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Schedule__c WHERE ClassHeader__c = '${idClass}' ${query02} AND Status__c = 'ACCEPT'`,
        (error, result) => {
          if (error) {
          console.log(error);
          return;
          }
          console.log(result);
          result.records.forEach((ls) => {
            delete ls.attributes;
            resultData.Schedule = ls;
          });
        }
      );
      let query = '';
      if(day && day !== ''){
        query += `AND Day__c = '${day}'`;
      }
      await salesforce.query(
        `SELECT ${this.defaultFieldsScheduleSubject} FROM ScheduleSubject__c WHERE Schedule__c = '${resultData.Schedule.Id}' ${query}`,
        (error, result) => {
          if (error) {
            return;
          }
          console.log(result);
          result.records.forEach((ls) => {
            delete ls.attributes;
          });
          
          resultData.Schedule.detail = [...result.records];
          return res.json(resultData);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };
  
  createSchedule = async (req, res) => {
    try {
      // "Title__c": "TKB - HK1 (2023 - 2024)",
      // "EndDate__c": "2023-12-31",
      // "StartDate__c": "2023-09-01",
      // "Status__c": "ACCEPT",
      const salesforce = await SalesforceConnection.getConnection();
      const data = req.body;
      console.log(data);
      if (!(data.Title__c && data.EndDate__c && data.StartDate__c && data.Status__c)){
        return res.status(400).send("All input is required");
      }
      let scheduleList = [];
      data.Schedule.forEach((schedule) => {
        var obj = {
          ClassHeader__c : schedule.ClassHeader__c,
          Name: data.Title__c,
          Title__c: data.Title__c,
          EndDate__c: data.EndDate__c,
          StartDate__c: data.StartDate__c,
          Status__c: data.Status__c,
        }
        scheduleList.push(obj);
      });
      // await salesforce.query(
      //   `SELECT Id FROM Schedule__c WHERE ClassHeader__c = '${idClass}' AND StartDate__c <= TODAY AND EndDate__c >= TODAY AND Status__c = 'ACCEPT'`,
      //   (error, result) => {
      //     if (error) {
      //       return;
      //     }
      //     console.log(result);
      //     result.records.forEach((ls) => {
      //       delete ls.attributes;
      //       resultData.Schedule = ls;
      //     });
      //   }
      // );

    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
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

  // createLesson = async (req, res) => {
  //   try {
  //     const salesforce = await SalesforceConnection.getConnection();
  //     const data = req.body;
  //     console.log(data);
  //     let listLessonCreate = [];
  //     let listLessonUpdate = [];
  //     data.forEach((lessonItem) => {
  //       if (
  //         !(
  //           lessonItem.sentDay &&
  //           lessonItem.content &&
  //           lessonItem.title &&
  //           lessonItem.classID
  //         )
  //       ) {
  //         return res.status(400).send("All input is required");
  //       }
  //       var lesson = {
  //         Status__c: lessonItem.status ? lessonItem.status : (lessonItem.isAutoSent ? "Pending" : "Accepted"),
  //         SentDay__c: lessonItem.sentDay,
  //         SendTime__c: lessonItem.sendTime !== undefined ? lessonItem.sendTime : null,
  //         SendMinute__c: lessonItem.sendMinute !== undefined ? lessonItem.sendMinute : null,
  //         IsAutoSent__c: lessonItem.isAutoSent ? lessonItem.isAutoSent : false,
  //         Content__c: lessonItem.content,
  //         Title__c: lessonItem.title,
  //         Name: lessonItem.title,
  //       };
  //       if (lessonItem.lessonID) {
  //         lesson.Id = lessonItem.lessonID;
  //         listLessonUpdate.push(lesson);
  //       } else {
  //         lesson.Class__c = lessonItem.classID;
  //         listLessonCreate.push(lesson);
  //       }
  //     });
  //     if(listLessonCreate.length){
  //       const newLessionCreate = await salesforce
  //         .sobject("Lesson__c")
  //         .create(listLessonCreate, function (err, ret) {
  //           if (err) {
  //             return { error: err };
  //           }
  //           listLessonCreate.forEach((item, index) => {
  //             item.Id = ret[index].id;
  //           })
  //         });
  //       if (newLessionCreate?.error)
  //         return res
  //           .status(500)
  //           .send("Internal Server Error: " + newLessionCreate.error);
  //       console.log(newLessionCreate);
  //     }
  //     if(listLessonUpdate.length){
  //       const newLessionUpdate = await salesforce
  //         .sobject("Lesson__c")
  //         .update(listLessonUpdate, function (err, ret) {
  //           if (err) {
  //             return { error: err };
  //           }
  //         });
  //       if (newLessionUpdate?.error)
  //         return res
  //           .status(500)
  //           .send("Internal Server Error: 2" + newLessionUpdate.error);
  //       console.log(newLessionUpdate);
  //     }

  //     const listLesson = listLessonCreate.concat(listLessonUpdate);
  //     listLesson.forEach(async (item, index) => {
  //       if (item.IsAutoSent__c) {
  //         const date = new Date(item.SentDay__c);
  //         let conExp =
  //           "0 " +
  //           item.SendMinute__c +
  //           " " +
  //           item.SendTime__c +
  //           " " +
  //           date.getDate() +
  //           " " +
  //           (date.getMonth() + 1) +
  //           " ? " +
  //           date.getFullYear();
  //         let autoLesson = {
  //           Name: item.Name,
  //           Id: item.Id,
  //           SendTime__c: item.SendTime__c,
  //           SendMinute__c: item.SendMinute__c,
  //         };
  //         var body = { lesson: autoLesson, exp: conExp };
  //         await salesforce.apex.post(
  //           "/lesson/autosend/",
  //           body,
  //           function (err, ret) {
  //             if (err) {
  //               return res.status(500).send("Internal Server Error: " + err);
  //             }
  //             autoLesson.JobID__c = ret;
  //             item.JobID__c = ret;
  //           }
  //         );
  //         await salesforce
  //           .sobject("Lesson__c")
  //           .update(autoLesson, function (err, ret) {
  //             if (err || !ret.success) {
  //               return res.status(500).send("Internal Server Error: " + err);
  //             }
  //           });
  //       }
  //     })
  //     return res.status(201).json({
  //       status: 201,
  //       data: listLesson,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
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
module.exports = new ScheduleController();
