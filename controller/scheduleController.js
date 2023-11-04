let scheduleList = [];
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
      if (!(data.Title__c && data.EndDate__c && data.StartDate__c && data.Status__c)){
        return res.status(400).send("All input is required");
      }
      if(!data.Schedule || data.Schedule.length === 0) {
        return res.status(400).send("None Schedule for import");
      }
      let scheduleList = [];
      let classHeaderIDList = [];
      let errorData;
      data.Schedule.forEach((schedule) => {
        var obj = {
          ClassHeader__c : schedule.ClassHeader__c,
          Name: data.Title__c,
          Title__c: data.Title__c,
          EndDate__c: data.EndDate__c,
          StartDate__c: data.StartDate__c,
          Status__c: data.Status__c,
        };
        scheduleList.push(obj);
        classHeaderIDList.push(schedule.ClassHeader__c);
      });

      let query = `('${classHeaderIDList.join("', '")}')`
      let scheduleListExisted = [];
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Schedule__c 
          WHERE ClassHeader__c IN ${query}
              AND Status__c = 'ACCEPT'
              AND EndDate__c >= ${data.StartDate__c}
              AND StartDate__c <= ${data.EndDate__c}
        `,
        (error, result) => {
          if (error) {
            errorData = error;
            return;
          }
          result.records.forEach((ls) => {
            delete ls.attributes;
            scheduleListExisted.push(ls);
          });
        }
      );

      if(scheduleListExisted.length > 0){
        var resultData = {
          status : 4000,
          ScheduleExisted: scheduleListExisted
        };
        return res.json(resultData);
      }

      const newScheduleCreate = await salesforce
      .sobject("Schedule__c")
      .create(scheduleList, function (err, ret) {
        if (err) {
          return { error: err };
        }
        data.Schedule.forEach((item, index) => {
          item.Id = ret[index].id;
        })
      });
      if (newScheduleCreate?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newScheduleCreate.error);
      console.log(scheduleList);

      let subject;
      await salesforce.query(
        `SELECT Id, MaMonHoc__c, Name FROM Subject__c`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach((ls) => {
            delete ls.attributes;
          });
          subject = new Map(
            result.records.map(obj => {
              return [obj.MaMonHoc__c, obj];
            }),
          );
        }
      );

      let scheduleSubjectList = [];
      data.Schedule.forEach((schedule) => {
        schedule.detail.forEach((item) => {
          scheduleSubjectList.push({
            Name: subject.get(item.MaMonHoc)?.Name ? subject.get(item.MaMonHoc)?.Name : item.Name,
            Schedule__c: schedule.Id,
            Subject__c: subject.get(item.MaMonHoc)?.Id ? subject.get(item.MaMonHoc)?.Id : null,
            Lesson__c: item.Lesson__c,
            Day__c: item.Day__c
          });
        })
      });

      console.log(scheduleSubjectList);
      const scheduleSubject = await salesforce
      .sobject("ScheduleSubject__c")
      .create(scheduleSubjectList, function (err, ret) {
        if (err) {
          return { error: err };
        }
      });
      if (scheduleSubject?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + scheduleSubject.error);
  
      var resultData = {
        status : 200,
        Message: 'SUCCESS'
      };
      return res.json(resultData);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

}
module.exports = new ScheduleController();
