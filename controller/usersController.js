const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const salesforce = require('../config/loginSalesforce').getConnection();
const returnResult = require('../utils/utilReturnData');
class UsersController {
    constructor(){
        this.defaultFields = 'Id, Name, UserName__c, BirthDay__c, Email__c, Gender__c, Phone__c, Password__c';
    }

    getAllUser = async (req, res) => {
        try {
            await salesforce.query(
            `SELECT ${this.defaultFields} FROM Users__c`,
            (error, result) => {
                if (error) {
                    returnResult.returnError(error, res);
                }
                returnResult.returnSuccess(result, res);
            });
        } catch (error) {
            returnResult.returnError(error, res);
        }
    }

    getUserbyId = async (req, res) => {
        const id = req.params.id;
        try {
            await salesforce.query(
                `SELECT ${this.defaultFields} FROM Users__c WHERE Id = '${id}'`,
            (error, result) => {
                if (error) {
                    returnResult.returnError(error, res);
                }
                returnResult.returnSuccess(result, res);
            });
        } catch (error) {
            returnResult.returnError(error, res);
        }
    }

    login = async (req, res) => {
        try {
            const {phone, password} = req.body;
            if (!(phone && password)) {
                return res.status(400).send("All input is required");
            }
            const result = await this.getUserByPhone(phone);
            if(!result || result?.error) return res.status(500).send("Internal Server Error when get user has same phone: " + result.error);
            const user = result?.totalSize > 0 ? result?.records[0] : null;
            if (user && (await bcrypt.compare(password, user.Password__c))) {
                const token = jwt.sign(
                    {user_id: user.Id, phone},
                    process.env.TOKEN_KEY,
                    {expiresIn: "2h",}
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
            const {name, birthDay, email, gender, phone, password} = req.body;
            if (!(email && password && name && phone)) {
                res.status(400).send("All input is required");
            }
            const result = await this.getUserByPhone(phone);
            const result2 = await this.getUserByEmail(email);
            if(result){
                const oldUser = result?.totalSize > 0 ? result?.records[0] : null;
                if (oldUser) return res.status(409).send("User Already Exist Phone. Please Login");
            }
            if(result2){
                const oldUser = result2?.totalSize > 0 ? result2?.records[0] : null;
                if (oldUser) return res.status(409).send("User Already Exist Email. Please Login");
            }
            
            var encryptedPassword = await bcrypt.hash(password, 10);

            var user = {
                UserName__c: name,
                BirthDay__c: birthDay,
                Email__c: email.toLowerCase(),
                Gender__c: gender,
                Phone__c: phone,
                Password__c: encryptedPassword}

            const idNewUser = await salesforce.sobject("Users__c").create(user, 
                function(err, ret) {
                    if (err || !ret.success) {return {error: err};}
                    console.log(ret);
                    return ret.id;
            });
            if(idNewUser?.error) return res.status(500).send("Internal Server Error: 2" + idNewUser.error);
            user.Id = idNewUser.id;
        
            // Create token
            const token = jwt.sign(
                { user_id: user.Id, phone },
                process.env.TOKEN_KEY,
                {expiresIn: "2h",}
            );
            user.token = token;
            delete user.Password__c;
            return res.status(201).json({
                status : 201,
                data : [user]
            });
        } catch (err) {
          console.log(err);
        }
    };

    getUserByPhone = async (phone) => {
        var rs = await salesforce.query(
            `SELECT ${this.defaultFields} FROM Users__c WHERE Phone__c = '${phone}'`,
            (error, result) => {
                if (error) {
                    return {error : error};
                }
                return result;
        });
        return rs;
    }

    getUserByEmail = async (email) => {
        var rs = await salesforce.query(
            `SELECT ${this.defaultFields} FROM Users__c WHERE Email__c = '${email}'`,
            (error, result) => {
                if (error) {
                    return {error : error};
                }
                return result;
        });
        return rs;
    }
}
module.exports = new UsersController();
