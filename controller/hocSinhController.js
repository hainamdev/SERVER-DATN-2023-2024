const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class HocSinhController {
  constructor() {
    this.defaultFields =
      "Id, Name, Ma_Hoc_Sinh__c, NgayVaoTruong__c, DanToc__c, TonGiao__c, MaDinhDanh__c, NgaySinh__c, GioiTinh__c, Address__c";
  }

  getHocSinhAll= async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM HocSinh__c`,
        (error, result) => {
          if (error) {
            return;
          }
          result.records.forEach((item) => {
            delete item.attributes;
            });
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };
  getHocSinhByID = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const id = req.params.id;
      if(id && id !== ''){
        await salesforce.query(
          `SELECT ${this.defaultFields} FROM HocSinh__c WHERE Id = '${id}'`,
          (error, result) => {
            if (error) {
              // returnResult.returnError(error, res);
              return;
            }
            delete result.records[0].attributes;
            returnResult.returnSuccess(result, res);
          }
        );
      }
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  deleteHocSinh = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const { id } = req.body;
      salesforce.sobject("HocSinh__c").destroy(id, function (err, ret) {
        if (err || !ret.success) {
          // return res.status(500).send("Internal Server Error: " + err);
          return;
        }
        return res.status(200).send("Success");
      });
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  createHocSinh = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      let hocsinh = {...req.body};
      let parent = Object.assign({}, hocsinh).parent;
      delete hocsinh.parent;
      if(hocsinh.Id) {
        const newhocsinh = await salesforce
        .sobject("HocSinh__c")
        .update(hocsinh, function (err, ret) {
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
        .sobject("HocSinh__c")
        .create(hocsinh, function (err, ret) {
          if (err) {
            return { error: err };
          }
          hocsinh.Id = ret.id;
        });
        if (newUser?.error)
        return res
          .status(500)
          .send("Internal Server Error: " + newUser.error);

        if(parent){
          parent.forEach((item) => {item.HocSinh__c = hocsinh.Id});

          const newParent = await salesforce
          .sobject("ParentStudent__c")
          .create(parent, function (err, rets) {
            if (err) {
              return { error: err };
            }
            for(let i = 0; i < rets.length; i++){
              parent[i].Id = rets[i].id;
            }
            hocsinh.parent = parent;
          });
          if (newParent?.error)
          return res
            .status(500)
            .send("Internal Server Error: " + newParent.error);  
        }
      }
      res.json(hocsinh);
    } catch (err) {
      console.log(err);
      return res.status(500).send("error: " + err.errorCode);
    }
  };
}
module.exports = new HocSinhController();
