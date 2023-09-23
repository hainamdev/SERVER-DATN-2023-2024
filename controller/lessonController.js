const salesforce = require("../config/loginSalesforce").getConnection();
const returnResult = require("../utils/utilReturnData");
class LessonController {
  constructor() {
    this.defaultFields =
      "Id, Name, CreatedDate, LastModifiedDate, Status__c, SentDay__c, IsAutoSent__c, Content__c, Title__c";
  }

  getAllLessonById = async (req, res) => {
    try {
      const id = req.params.id;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Lesson__c WHERE Id = '${id}'`,
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

  getAllLessonByIdLop = async (req, res) => {
    try {
      const idLop = req.params.idLop;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Lesson__c WHERE Class__c = '${idLop}' ORDER BY SentDay__c DESC`,
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
      const {
        status,
        sentDay,
        isAutoSent,
        content,
        title,
        classID,
        lessonID,
        sendTime,
        sendMinute,
      } = req.body;
      if (!(status && sentDay && content && title && classID)) {
        res.status(400).send("All input is required");
      }
      var lesson = {
        Status__c: status ? status : isAutoSent ? "Pending" : "Accepted",
        SentDay__c: sentDay,
        IsAutoSent__c: isAutoSent ? isAutoSent : false,
        Content__c: content,
        Title__c: title,
        Name: title,
      };

      if (lessonID) {
        lesson.Id = lessonID;
        const idNewLession = await salesforce
          .sobject("Lesson__c")
          .update(lesson, function (err, ret) {
            if (err || !ret.success) {
              return { error: err };
            }
            return ret.id;
          });
        if (idNewLession?.error)
          return res
            .status(500)
            .send("Internal Server Error: 2" + idNewUser.error);
      } else {
        lesson.Class__c = classID;
        const idNewLession = await salesforce
          .sobject("Lesson__c")
          .create(lesson, function (err, ret) {
            if (err || !ret.success) {
              return { error: err };
            }
            return ret.id;
          });
        if (idNewLession?.error)
          return res
            .status(500)
            .send("Internal Server Error: 2" + idNewUser.error);
        lesson.Id = idNewLession.id;
      }

      if (lesson.IsAutoSent__c) {
        const date = new Date(sentDay);
        let conExp =
          "0 " +
          sendMinute +
          " " +
          sendTime +
          " " +
          date.getDate() +
          " " +
          (date.getMonth() + 1) +
          " ? " +
          date.getFullYear();
        let autoLesson = {
          Name: lesson.Name,
          Id: lesson.Id,
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
      return res.status(201).json({
        status: 201,
        data: [lesson],
      });
    } catch (err) {
      console.log(err);
    }
  };
}
module.exports = new LessonController();
