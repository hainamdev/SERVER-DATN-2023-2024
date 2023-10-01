const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SalesforceConnection = require("../config/loginSalesforce");
const returnResult = require("../utils/utilReturnData");
class UsersController {
  constructor() {
    this.defaultFields = "Id, Email__c, Phone__c, Password__c";
  }

  getAllUser = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Users__c`,
        (error, result) => {
          if (error) {
            returnResult.returnError(error, res);
          }
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  getUserbyId = async (req, res) => {
    try {
      const id = req.params.id;
      const salesforce = await SalesforceConnection.getConnection();
      await salesforce.query(
        `SELECT ${this.defaultFields} FROM Users__c WHERE Id = '${id}'`,
        (error, result) => {
          if (error) {
            returnResult.returnError(error, res);
          }
          returnResult.returnSuccess(result, res);
        }
      );
    } catch (error) {
      returnResult.returnError(error, res);
    }
  };

  login = async (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!(phone && password)) {
        return res.status(400).send("All input is required");
      }
      const result = await this.getUserByPhone(phone);
      console.log(result);
      if (!result || result?.error)
        return res
          .status(500)
          .send("Internal Server Error when get user has same phone");
      const user = result?.totalSize > 0 ? result?.records[0] : null;
      if (user && (await bcrypt.compare(password, user.Password__c))) {
        const token = jwt.sign(
          { user_id: user.Id, phone },
          process.env.TOKEN_KEY,
          { expiresIn: "2h" }
        );
        user.token = token;
        delete user.Password__c;
        return res.status(200).json(user);
      }
      return res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
  };

  register = async (req, res) => {
    try {
      const salesforce = await SalesforceConnection.getConnection();
      const { name, birthDay, email, gender, phone, password } = req.body;
      if (!(email && password && name && phone)) {
        res.status(400).send("All input is required");
      }
      const result = await this.getUserByPhone(phone);
      const result2 = await this.getUserByEmail(email);
      if (result) {
        const oldUser = result?.totalSize > 0 ? result?.records[0] : null;
        if (oldUser)
          return res.status(409).send("User Already Exist Phone. Please Login");
      }
      if (result2) {
        const oldUser = result2?.totalSize > 0 ? result2?.records[0] : null;
        if (oldUser)
          return res.status(409).send("User Already Exist Email. Please Login");
      }

      var encryptedPassword = await bcrypt.hash(password, 10);

      var user = {
        UserName__c: name,
        BirthDay__c: birthDay,
        Email__c: email.toLowerCase(),
        Gender__c: gender,
        Phone__c: phone,
        Password__c: encryptedPassword,
      };

      const idNewUser = await salesforce
        .sobject("Users__c")
        .create(user, function (err, ret) {
          if (err || !ret.success) {
            return { error: err };
          }
          console.log(ret);
          return ret.id;
        });
      if (idNewUser?.error)
        return res
          .status(500)
          .send("Internal Server Error: 2" + idNewUser.error);
      user.Id = idNewUser.id;

      // Create token
      const token = jwt.sign(
        { user_id: user.Id, phone },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
      );
      user.token = token;
      delete user.Password__c;
      return res.status(201).json({
        status: 201,
        data: [user],
      });
    } catch (err) {
      console.log(err);
    }
  };

  getUserByPhone = async (phone) => {
    const salesforce = await SalesforceConnection.getConnection();
    let rs = await salesforce.query(
      `SELECT ${this.defaultFields} FROM Users__c WHERE Phone__c = '${phone}'`,
      (error, result) => {
        if (error) {
          return { error: error };
        }
        return result;
      }
    );
    if (!rs.records.length || rs.error) {
      return rs.error ? rs : { error: " " };
    }

    let userRole = await salesforce.query(
      `SELECT Id, Role__c FROM UserRole__c WHERE Users__c = '${rs.records[0].Id}'`,
      (error, result) => {
        if (error) {
          return { error: error };
        }
        return result;
      }
    );

    if (!userRole.records.length || userRole.error) {
      return userRole.error ? userRole : { error: " " };
    }

    let role = await salesforce.query(
      `SELECT Id, Active__c, Description__c, Title__c FROM Role__c WHERE Id = '${userRole.records[0].Role__c}'`,
      (error, result) => {
        if (error) {
          return { error: error };
        }
        return result;
      }
    );

    if (!role.records.length || role.error) {
      return role.error ? role : { error: " " };
    }
    delete role.records[0].attributes;
    rs.records[0] = { ...rs.records[0], Role: role.records[0] };
    if (role.records[0].Title__c === "TEACHER") {
      let teacher = await salesforce.query(
        `SELECT Id, MaGiaoVien__c, Name FROM Teacher__c WHERE Users__c = '${rs.records[0].Id}'`,
        (error, result) => {
          if (error) {
            return { error: error };
          }
          return result;
        }
      );
      if (!teacher.records.length || teacher.error) {
        return teacher.error ? teacher : { error: " " };
      }
      delete teacher.records[0].attributes;
      rs.records[0] = { ...rs.records[0], Account: teacher.records[0] };
      let classInfo = await salesforce.query(
        `SELECT Id, Name, NumOfStudent__c, Status__c FROM ClassHeader__c WHERE GiaoVien__c = '${teacher.records[0].Id}' AND Status__c = 'Active'`,
        (error, result) => {
          if (error) {
            return { error: error };
          }
          return result;
        }
      );
      if (!classInfo || classInfo.error) {
        return classInfo.error ? classInfo : { error: " " };
      }
      delete classInfo.records[0].attributes;
      rs.records[0] = { ...rs.records[0], Class: classInfo.records[0] };
    } else if (role.records[0].Title__c === "PARENT") {
      let parent = await salesforce.query(
        `SELECT Id, Name FROM Parent__c WHERE Users__c  = '${rs.records[0].Id}'`,
        (error, result) => {
          if (error) {
            return { error: error };
          }
          return result;
        }
      );
      if (!parent.records.length || parent.error) {
        return parent.error ? parent : { error: " " };
      }
      let parentHocSinh = await salesforce.query(
        `SELECT Id, Name, HocSinh__c, Parent__c FROM ParentStudent__c WHERE Parent__c = '${parent.records[0].Id}'`,
        (error, result) => {
          if (error) {
            return { error: error };
          }
          return result;
        }
      );
      if (!parentHocSinh.records.length || parentHocSinh.error) {
        return parentHocSinh.error ? parentHocSinh : { error: " " };
      }
      let hocSinh = await salesforce.query(
        `SELECT Id, Name FROM HocSinh__c WHERE Id = '${parentHocSinh.records[0].HocSinh__c}'`,
        (error, result) => {
          if (error) {
            return { error: error };
          }
          return result;
        }
      );
      if (!hocSinh.records.length || hocSinh.error) {
        return hocSinh.error ? hocSinh : { error: " " };
      }
      delete hocSinh.records[0].attributes;
      rs.records[0] = { ...rs.records[0], Student: hocSinh.records[0] };
      let classInfo = await salesforce.query(
        `SELECT Id, Name, ClassHeader__c FROM ClassLine__c WHERE HocSinh__c = '${hocSinh.records[0].Id}' AND ClassHeader__r.Status__c = 'Active'`,
        (error, result) => {
          if (error) {
            return { error: error };
          }
          return result;
        }
      );
      if (!classInfo || classInfo.error) {
        return classInfo.error ? classInfo : { error: " " };
      }
      delete classInfo.records[0].attributes;
      rs.records[0] = { ...rs.records[0], Class:{Id: classInfo.records[0].ClassHeader__c} };
    }
    delete rs.records[0].attributes;
    return rs;
  };

  getUserByEmail = async (email) => {
    const salesforce = await SalesforceConnection.getConnection();
    var rs = await salesforce.query(
      `SELECT ${this.defaultFields} FROM Users__c WHERE Email__c = '${email}'`,
      (error, result) => {
        if (error) {
          return { error: error };
        }
        return result;
      }
    );
    return rs;
  };
}
module.exports = new UsersController();
