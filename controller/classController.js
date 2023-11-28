const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class ClassController {

  constructor() {
    this.defaultFields = "Id, Name, GiaoVien__c, NumOfStudent__c, Status__c, SchoolYear__c, CreatedDate, LastModifiedDate";
  }

  getHocSinhByIDLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      if(!id) return res.status(500).send("Data request is nothing");
      let listHocSinh = [];
      let rs = [];
      await salesforce.query(
        `SELECT HocSinh__c FROM ClassLine__c WHERE ClassHeader__c = '${id}'`,
        (error, result) => {
          if (error) return rs;
          rs = result.records.map((item) => {
            return item.HocSinh__c;
          });
        }
      );

      if (rs.length) {
        let tmp = "'" + rs.join("','") + "'";
        listHocSinh = await salesforce.query(
          `SELECT Id, Ma_Hoc_Sinh__c, Name, NgaySinh__c, GioiTinh__c FROM HocSinh__c WHERE Id IN (${tmp})`,
          (error, result) => {
            if (error) return [];
            result.records.forEach((hs) => {
              delete hs.attributes;
            });
            return result.records;
          }
        );
      }

      await salesforce.query(
        `SELECT Id, Name, GiaoVien__c, NumOfStudent__c, Status__c FROM ClassHeader__c WHERE Id = '${id}'`,
        (error, result) => {
          if (error) {
            // returnResult.returnError(error, res);
            return;
          }
          delete result.records[0].attributes;
          result.records[0] = {
            ...result.records[0],
            Student: [...listHocSinh],
          };
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      // returnResult.returnError(error, res);
      res.status(500).json(error);
    }
  };

  getAllLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const year = req.query?.year;
      let query02 = (year && year !== '') ? ` WHERE SchoolYear__c = ${year} ` : '';
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM ClassHeader__c ${query02}`,
        (error, result) => {
          if (error) return;
          result.records.forEach((ls) => {
            delete ls.attributes;
          });
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  };
  
  addStudent  = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const data = {...req.body};
      let dataAdd = [];
      data.hocsinh.forEach((item) => {
        dataAdd.push({
          ClassHeader__c : data.classId,
          HocSinh__c : item
        })
        
      });
      const newParent = await salesforce
      .sobject("ClassLine__c")
      .create(dataAdd, function (err, rets) {
        if (err) {
          return { error: err };
        }
        for(let i = 0; i < rets.length; i++){
          dataAdd[i].Id = rets[i].id;
        }
        data.hocsinh = dataAdd;
      });
      if (newParent?.error)
      return res
        .status(500)
        .send("Internal Server Error: " + newParent.error);  
      res.json(data);
    } catch (error) {
      return res
        .status(500)
        .send("Internal Server Error: " + error);
    }
  };

  deleteLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const { id } = req.body;
      salesforce.sobject("ClassHeader__c").update({Id: id, Status__c: 'Deleted'}, function (err, ret) {
        if (err) {
          // return res.status(500).send("Internal Server Error: " + err);
          return;
        }
        return res.status(200).send("Success");
      });
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  createLop = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      let lop = {...req.body};
      let hocsinh = Object.assign({}, lop).hocsinh;
      delete lop.hocsinh;
      if(lop.Id) {
        const newhocsinh = await salesforce
        .sobject("ClassHeader__c")
        .update(lop, function (err, ret) {
          if (err) {
            return { error: err };
          }
        });
        if (newhocsinh?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newhocsinh.error);
      } else {
        const newUser = await salesforce
        .sobject("ClassHeader__c")
        .create(lop, function (err, ret) {
          if (err) {
            return { error: err };
          }
          lop.Id = ret.id;
        });
        if (newUser?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newUser.error);

        if(hocsinh){
          hocsinh.forEach((item) => {item.ClassHeader__c = lop.Id});

          const newParent = await salesforce
          .sobject("ClassLine__c")
          .create(hocsinh, function (err, rets) {
            if (err) {
              return { error: err };
            }
            for(let i = 0; i < rets.length; i++){
              hocsinh[i].Id = rets[i].id;
            }
            lop.hocsinh = hocsinh;
          });
          if (newParent?.error)
          return res
            .status(500)
            .send("Internal Server Error: " + newParent.error);  
        }
      }
      res.json(lop);
    } catch (err) {
      console.log(err);
      return res.status(500).send("error: " + err.errorCode);
    }
  };
}
module.exports = new ClassController();
