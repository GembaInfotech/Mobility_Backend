const Boom = require('@hapi/boom');
const CONFIG = require('../Config');
const { APP_CONSTANTS } = require('../Config');
const Joi = require('joi');
const Modal = require('../Models');
const Service = require('../Services').queries;
const got = require('got');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const startingId = 100001
const UploadMultipart = require("../Lib/UploadManager");


const sendSuccess = (successMsg, data) => {
    successMsg = successMsg || CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT.customMessage;
    const statusCode = typeof successMsg === 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage') ? successMsg.statusCode : 200;
    const message = typeof successMsg === 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage') ? successMsg.customMessage : successMsg;
    return { statusCode, message, data: data || null };
};

async function cryptData(stringToCrypt) {
    return new Promise((resolve,reject) => {
        bcrypt.hash(stringToCrypt, saltRounds, function(err, hash) {
            if(err) reject(err);
            else resolve(hash)
        });
    })
}

async function comparePassword(data,hash) {
    return new Promise((resolve,reject) => {
        bcrypt.compare(data, hash, function(err, res) {
            if(err) reject(err);
            else resolve(res)
        })
    })
}

const sendError = function (data) {
    try {
        if (typeof data === 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {
            return new Boom.Boom(data.customMessage, { statusCode: data.statusCode});
        } else {
            let errorToSend = '';
            if (typeof data === 'object') {
                if (data.name === 'MongoError') {
                    errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
                    if (data.code === 11000) {
                        let duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
                        duplicateValue = duplicateValue.replace('}','');
                        errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + " : " + duplicateValue;
                        //console.log("==================errorToSend==================",data.message)
                        if (data.message.indexOf('email_1')>-1){
                            errorToSend = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIl_ALREADY_EXIST.customMessage;
                        }
                    }
                } else if (data.name === 'ApplicationError') {
                    errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + ' : ';
                } else if (data.name === 'ValidationError') {
                    errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + data.message;
                } else if (data.name === 'CastError') {
                    errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage + CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage + data.value;
                }
            } else {
                errorToSend = data
            }
            let customErrorMessage = errorToSend;
            if (typeof customErrorMessage === 'string'){
                if (errorToSend.indexOf("[") > -1) {
                    customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
                }
                customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
                customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
                customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');
            }
            return Boom.badRequest(customErrorMessage, data)
        }
    }
    catch (e) {
        throw e
    }

};

const failActionFunction = function (request, h, error) {

    console.log(".............fail action.................",error.output.payload.message);
    let customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation;
    return error;
};

const authorizationHeaderObj = Joi.object({
    authorization: Joi.string().required()
}).unknown();

const generateRandomString = function () {
    return randomString.generate(7);
};

const generateResponseMessage = function (errorObject, language) {

    errorObject = {...errorObject};
    let lang =  language ? language : CONFIG.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
    errorObject.customMessage =  errorObject.customMessage[lang];
    return errorObject
};

const generateOTP = function () {
    const length = 5;
    const allowsChars = '0123456789';
    let char = '';

    while (char.length < length) {
        const random = Math.random();
        let charIndex = Math.floor(random * ((allowsChars.length - 1)));
        char += allowsChars[charIndex]
    }
    return char;
};

async function logout(userData) {
    const update = {
        $pull : {
            tokens : {
                deviceId : userData.deviceId
            }
        }
    }
    await Service.findAndUpdate(findModel(userData.userType), {_id :userData._id}, update, {});
    return {};
}

function findModel(userType) {
    let model;
  
    switch (userType) {
      case APP_CONSTANTS.DATABASE.USER_TYPE.SUPER_ADMIN:
        model = Modal.Admins;
        break;
      case APP_CONSTANTS.DATABASE.USER_TYPE.CUSTOMER:
        model = Modal.Customers;
        break;
      default:
        throw new Error("Invalid user type");
    }
    return model;
}

const checkDuplicate = async (criteria, model , typeToCheck) => {
    const data = await Service.findOne(model, criteria, { _id: 1 }, { lean: true });

    if(data) {
        switch (typeToCheck){
            case 'phone' :{
                return Promise.reject(generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST));
            }
            case 'email' :{
                return Promise.reject(generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.EMAIl_ALREADY_EXIST));
            }
        }
    } 
}

async function sendSms (criteria){
    try {
        const { to, body, id } = criteria;
        const username = "";
        const password = "";
        const sender = "";
        const route = 2;
        const url = ``;
        got(url)
        .then((res) => {
            console.log(res.statusCode, res.statusMessage)
        });

    } catch (error) {
        console.log('error',error.response.body);
    }
}

function generatePassword(){
    const password = process.env.NODE_ENV === 'dev' ? 'qwerty' : 'qwerty' //Math.random().toString(36).slice(-8);
    return password
}

function findListingModel(type) {
    let model
    switch (type) {
        case 1:
            model = Modal.DeviceTypes;
            break;
        case 2:
            model = Modal.Locations;
            break;
        case 3:
            model = Modal.Codes;
            break;
        case 4:
            model = Modal.InsuranceCompanies;
            break;
        case 5:
            model = Modal.Physician;
            break;
        case 6:
            model = Modal.Patients;
            break;
        case 7:
            model = Modal.Admins;
            break;   
        case 8:
            model = Modal.Prescriptions;
            break;   

        default:
            break;
    }

    return model
}

async function generateUniqueNo(type) {

    let model;
    if(type === 1) model = Modal.Patients;
    if(type === 2) model = Modal.Prescriptions;

    let check = await Service.findOne(model,{},{patientNo : 1,orderNo:1},{sort :{_id:-1}});

    if (!check) {
        newNumber = startingId;
    } else {
        const alreadyId = check.patientNo || check.orderNo;
        let previousNumber = Number(alreadyId.match(/\d+/));
        newNumber = previousNumber + 1;
    }

    return `${type === 1 ? 'P' : type === 2 ? 'S' : 'PR'}${newNumber}`
}

async function uploadFileStorage(image, folder) {

    if (Array.isArray(image)) {
        return new Promise((resolve, reject) => {
            let imageData = [], len = image.length, count = 0;
            image.map((obj) => {
                UploadMultipart.uploadFilesOnBucket(obj, folder)
                .then((result) => {
                        count++;
                        imageData.push(result);
                        if (count === len)
                            resolve(imageData)
                })
                .catch((error) => reject(error))    
            })
        });
    } else {
        return new Promise((resolve, reject) => {
            UploadMultipart.uploadFilesOnBucket(image, folder).then((result) => {
                resolve(result)
            })
            .catch((error) => reject(error))
        });
    }
}

module.exports = {
    failActionFunction,
    sendSuccess,
    sendError,
    authorizationHeaderObj,
    cryptData,
    comparePassword,
    CONFIG,
    logout,
    generateRandomString,
    generateResponseMessage,
    generateOTP,
    sendSms,
    findListingModel,
    findModel,
    checkDuplicate,
    generatePassword,
    generateUniqueNo,
    uploadFileStorage
};

