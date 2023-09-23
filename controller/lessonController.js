const salesforce = require("../config/loginSalesforce").getConnection();
const returnResult = require("../utils/utilReturnData");
class LessonController {
  constructor() {
    this.defaultFields =
      "Id, Name, CreatedDate, LastModifiedDate, Status__c, SentDay__c, IsAutoSent__c, Content__c, Title__c";
  }

  getAllLessonByIdLop = async (req, res) => {
    try {
      const idLop = req.params.idLop;
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Lesson__c WHERE Class__c = '${idLop}' Order by SentDay__c DESC`,
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

  createLesson = async (req, res) => {
    try {
      const { status, sentDay, isAutoSent, content, title, classID, lessonID } =
        req.body;
      if (!(status && sentDay && content && title && classID)) {
        res.status(400).send("All input is required");
      }
      var lesson = {
        Status__c: status,
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
