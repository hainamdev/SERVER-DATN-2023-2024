const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class ThongKeController {
  constructor() {
    // this.defaultFields =
    //   "Id, Name, CreatedDate, LastModifiedDate, Status__c, SentDay__c, 	SendTime__c, SendMinute__c, IsAutoSent__c, Content__c, Title__c";
  }

  getThongKeScore = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const data = req.body;
      let listIDEvaluation = [];
      let result = {
        total : 0,
        numHTSX : 0,
        numHTT : 0,
        numHT : 0,
        numCHT : 0,
        listHTSX : [],
        listHTT : [],
        listHT : [],
        listCHT : [],
      };
      let eva = await salesforce.query(
        `SELECT Id, Name, CreatedDate, ClassHeader__c, HocSinh__c, Type__c 
          FROM Evaluation_Sheet__c 
          WHERE ClassHeader__c = '${data.eva_class_id}' 
            AND Type__c = '${data.eva_type}'`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach(async (ls) => {
            delete ls.attributes;
            listIDEvaluation.push(ls.Id)
          });
          return result.records;
          // res.json(result);
        }
      );
      if(listIDEvaluation.length > 0){
        let score = [];
        var query = `
          SELECT Id, CreatedDate, Name, Evaluation_Sheet__c, Subject__c, EvaluationType__c, Score__c, Talent__c, Comment__c 
          FROM Score__c
          WHERE Evaluation_Sheet__c IN ('${listIDEvaluation.join("', '")}')
        `;
        // console.log(query);
        score = await salesforce.query(query,
          (error, result) => {
            if (error) {
              return [];
            }
            result.records.forEach(async (ls) => {
              delete ls.attributes;
            });
            return result.records;
          }
        );

        eva.forEach((item) => {
          let scoreByEva = score.filter((sc) => sc.Evaluation_Sheet__c === item.Id);
          // console.log(scoreByEva);
          // console.log(scoreByEva.length);
          if(scoreByEva.length > 0){
            result.total += 1;
            var valua = { 
              over9 : 0,
              over7 : 0,
              over5 : 0,
              under5 : 0,
              tot : 0,
              dat : 0,
              chuadat : 0,
            }
            scoreByEva.forEach((sc) => {
              if(sc.EvaluationType__c === 'TALENT'){
                valua.tot += (sc.Talent__c === 'Tốt') ? 1 : 0;
                valua.dat += (sc.Talent__c === 'Đạt') ? 1 : 0;
                valua.chuadat += (sc.Talent__c === 'Cần cố gắng') ? 1 : 0;
              } else {
                if (sc.Score__c >= 9) valua.over9 += 1;
                else if(sc.Score__c >= 7) valua.over7 += 1;
                else if(sc.Score__c >= 5) valua.over5 += 1;
                else valua.under5 += 1;
              }
            });
            item.ScoreDetail = scoreByEva;
            if(valua.under5 > 0 || valua.chuadat > 0){
              item.ability = 'Chưa hoàn thành';
              result.listCHT.push(item);
              result.numCHT += 1;
            }
            else if (valua.over5 > 0 || valua.dat > 0) {
              item.ability = 'Hoàn thành';
              result.listHT.push(item);
              result.numHT += 1;
            }
            else if (valua.over7 > 0) {
              item.ability = 'Hoàn thành tốt';
              result.listHTT.push(item);
              result.numHTT += 1;
            }
            else {
              item.ability = 'Hoàn thành xuất sắc';
              result.listHTSX.push(item);
              result.numHTSX += 1;
            }
          }
        });

        result.avg_score = [];

        var query_02 = `SELECT Id, Name, SubjectGroup__c, MaMonHoc__c FROM Subject__c where SubjectGroup__c = null`;
        // console.log(query);
        let subject = await salesforce.query(query_02,
          (error, result) => {
            if (error) {
              return [];
            }
            result.records.forEach(async (ls) => {
              delete ls.attributes;
            });
            return result.records;
          }
        );

        subject.forEach((item) => {
            let scoreBySubject = score.filter((sc) => sc.Subject__c === item.Id);
            if(scoreBySubject && scoreBySubject.length) {
              const sum = scoreBySubject.reduce((currentValue, sc) => sc.Score__c + currentValue, 0);
              result.avg_score.push({
                ...item,
                avg : (sum / scoreBySubject.length).toFixed(2)
              });
            }
        })
      }
      res.json(result);
    } catch (err) {
      console.log(err);
    }
  };

  getThongKeAttendance = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const data = req.body;
      data.from = data.from && data.from != null ? data.from : new Date();
      data.to = data.to && data.to != null ? data.to : new Date();
      let listIDEvaluation = [];
      let result = {
        total : 0,
        numPhep: 0,
        numKhongPhep: 0
      };

      let eva = await salesforce.query(
        `SELECT Id, Name, CreatedDate, LastModifiedDate, ClassHeader__c, Date__c, Status__c 
          FROM AttendanceDay__c
          WHERE Date__c >= ${data.from}
            AND Date__c <= ${data.to}`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach(async (ls) => {
            delete ls.attributes;
            listIDEvaluation.push(ls.Id)
          });
          return result.records;
          // res.json(result);
        }
      );
      // console.log(listIDEvaluation);

      if(listIDEvaluation.length > 0){
        let score = [];
        var query = `
          SELECT Id, Name, CreatedDate, LastModifiedDate, AttendanceDay__c, HocSinh__c, Status__c, note__c 
          FROM AttendanceLine__c
          WHERE AttendanceDay__c IN ('${listIDEvaluation.join("', '")}')
              AND Status__c != 'DI_HOC'
        `;
        // console.log(query);
        score = await salesforce.query(query,
          (error, result) => {
            if (error) {
              return [];
            }
            result.records.forEach(async (ls) => {
              delete ls.attributes;
            });
            return result.records;
          }
        );

        let scoreByEva = score.filter((sc) => sc.Status__c === 'PHEP');
        let scoreByEva_02 = score.filter((sc) => sc.Status__c === 'KHONG_PHEP');
        result.numPhep = scoreByEva.length;
        result.numKhongPhep = scoreByEva_02.length;
        result.total = result.numPhep  + result.numKhongPhep;
      }
      res.json(result);
    } catch (err) {
      console.log(err);
    }
  };
}
module.exports = new ThongKeController();
