const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class LessonController {
  constructor() {
    this.defaultFields =
      "Id, Name, CreatedDate, LastModifiedDate, Status__c, SentDay__c, 	SendTime__c, SendMinute__c, IsAutoSent__c, Content__c, Title__c";
  }

  getAllLessonById = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Lesson__c WHERE Id = '${id}'`,
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

  getAllLessonByIdLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const idLop = req.params.idLop;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Lesson__c WHERE Class__c = '${idLop}' ORDER BY LastModifiedDate DESC`,
        (error, result) => {
          if (error) {
            returnResult.returnError(error, res);
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

  deleteLesson = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const { id } = req.body;
      salesforce.sobject("Lesson__c").destroy(id, function (err, ret) {
        if (err || !ret.success) {
          return res.status(500).send("Internal Server Error: " + err);
        }
        return res.status(200).send("Success");
      });
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  createLesson = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      console.log(data);
      const data = req.body;
      let listLessonCreate = [];
      let listLessonUpdate = [];
      data.forEach((lessonItem) => {
        if (
          !(
            lessonItem.sentDay &&
            lessonItem.content &&
            lessonItem.title &&
            lessonItem.classID
          )
        ) {
          return res.status(400).send("All input is required");
        }
        var lesson = {
          Status__c: lessonItem.status
            ? lessonItem.status
            : lessonItem.isAutoSent
            ? "Pending"
            : "Accepted",
          SentDay__c: lessonItem.sentDay,
          SendTime__c: lessonItem.sendTime ? lessonItem.sendTime : null,
          SendMinute__c: lessonItem.sendMinute ? lessonItem.sendMinute : null,
          IsAutoSent__c: lessonItem.isAutoSent ? lessonItem.isAutoSent : false,
          Content__c: lessonItem.content,
          Title__c: lessonItem.title,
          Name: lessonItem.title,
        };
        if (lessonItem.lessonID) {
          lesson.Id = lessonItem.lessonID;
          listLessonUpdate.push(lesson);
        } else {
          lesson.Class__c = lessonItem.classID;
          listLessonCreate.push(lesson);
        }
      });
      if(listLessonCreate.length){
        const newLessionCreate = await salesforce
          .sobject("Lesson__c")
          .create(listLessonCreate, function (err, ret) {
            if (err) {
              return { error: err };
            }
            listLessonCreate.forEach((item, index) => {
              item.Id = ret[index].id;
            })
          });
        if (newLessionCreate?.error)
          return res
            .status(500)
            .send("Internal Server Error: 2" + newLessionCreate.error);
        console.log(newLessionCreate);
      }
      if(listLessonUpdate.length){
        const newLessionUpdate = await salesforce
          .sobject("Lesson__c")
          .update(listLessonUpdate, function (err, ret) {
            if (err) {
              return { error: err };
            }
          });
        if (newLessionUpdate?.error)
          return res
            .status(500)
            .send("Internal Server Error: 2" + newLessionUpdate.error);
        console.log(newLessionUpdate);
      }

      const listLesson = listLessonCreate.concat(listLessonUpdate);
      listLesson.forEach(async (item, index) => {
        if (item.IsAutoSent__c) {
          const date = new Date(item.sentDay);
          let conExp =
            "0 " +
            item.SendMinute__c +
            " " +
            item.SendTime__c +
            " " +
            date.getDate() +
            " " +
            (date.getMonth() + 1) +
            " ? " +
            date.getFullYear();
          let autoLesson = {
            Name: item.Name,
            Id: item.Id,
            SendTime__c: item.SendTime__c,
            SendMinute__c: item.SendMinute__c,
          };
          var body = { lesson: autoLesson, exp: conExp };
          await salesforce.apex.post(
            "/lesson/autosend/",
            body,
            function (err, res) {
              if (err) {
                return res.status(500).send("Internal Server Error: " + err);
              }
              autoLesson.JobID__c = res;
              item.JobID__c = res;
            }
          );
          await salesforce
            .sobject("Lesson__c")
            .update(autoLesson, function (err, ret) {
              if (err || !ret.success) {
                return res.status(500).send("Internal Server Error: " + err);
              }
            });
        }
      })
      return res.status(201).json({
        status: 201,
        data: listLesson,
      });
    } catch (err) {
      console.log(err);
    }
  };
}
module.exports = new LessonController();
