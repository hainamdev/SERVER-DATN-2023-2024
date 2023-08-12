const salesforce = require('../config/loginSalesforce').getConnection();
const returnResult = require('../utils/utilReturnData');
class UsersController {
    constructor(){
        this.defaultFields = 'Id, Name, UserName__c, BirthDay__c, Email__c, Gender__c, Phone__c';
    }

    getAllUser = (req, res) => {
        try {
            salesforce.query(
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

    getUserbyId = (req, res) => {
        const id = req.params.id;
        try {
            salesforce.query(
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
}
module.exports = new UsersController();
