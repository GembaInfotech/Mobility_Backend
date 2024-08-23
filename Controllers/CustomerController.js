"use strict";

const Service = require('../Services').queries;
const Modal = require('../Models');
const { generateResponseMessage, CryptData,
    comparePassword, findModel, checkDuplicate } = require('../Utils/UniversalFunction');
const { APP_CONSTANTS } = require('../Config');
const emailFunction = require('../Lib/EmailManager');
const TokenManager = require('../Lib/TokenManager');
const NotificationManager = require('../Lib/NotificationManager');
const { s3BucketCredentials } = require('../Config/AwsS3Config');
const { DATABASE } = require('../Config/AppConstants');

/*forgot password*/
async function forgotPassword(payloadData) {

    const criteria = {
        email: payloadData.email,
    };
    const populate = {
        path: 'userId', select: { tokens: 0, otp: 0 }
    }

    let result = await Service.findOneAndPopulate(Modal.Roles, criteria, {}, { lean: true }, populate);
    if (result && result._id) {
        if (result.userId.status === APP_CONSTANTS.DATABASE.STATUS.BLOCKED)
            throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED, payloadData.language);
        else {
            // let emailOtp = await generateCode(4);

            // sendMail({ name: result.name, email: payloadData.email, emailOtp });

            // await Service.findAndUpdate(modelName, { _id: result._id }, { emailOtp, otpSentAt: new Date() }, {});
            return {}
        }
    } else throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL, payloadData.language)
}

async function updatePassword(payloadData) {

    let criteria = {
        email: payloadData.email,
    };

    let dataToSet = {
        password: await CryptData(payloadData.password)
    };

    let modelName = payloadData.type === 1 ? Modal.Users : Modal.Admins;

    let data = await Service.findAndUpdate(modelName, criteria, dataToSet, { lean: true, new: true });

    if (data) {
        if (payloadData.type === 1)
            return { username: data?.username };
        else return {}
    }
    else {
        return Promise.reject(generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL, payloadData.language))
    }
}

function sendMail(data) {

    emailFunction.sendEmail(data.email, 'Animo password reset!', emailFunction.otpTemplate(data.emailOtp))
}

async function loginCheck(payloadData) {
    try {

        const criteria = {}

        criteria.email = payloadData.email

        const populate = {
            path: 'userId', select: { tokens: 0, otp: 0 }
        }

        const data = await Service.findOneAndPopulate(Modal.Roles, criteria, {}, { lean: true }, populate);

        if (!data || (data && data.userId.status === APP_CONSTANTS.DATABASE.STATUS.DELETED))
            throw generateResponseMessage(payloadData.phoneNumber ? APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE : APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL, payloadData.language);
        else if (data.userId.status === APP_CONSTANTS.DATABASE.STATUS.INACTIVE)
            throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED, payloadData.language);
        else if (payloadData.password && !await comparePassword(payloadData.password, data.userId.password)) {
            throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD, payloadData.language);
        }
        else {
            let tokenData = {
                userType: data.userType,
                userId: data.userId._id
            }
            if (payloadData.deviceId) tokenData.deviceId = payloadData.deviceId
            if (payloadData.deviceToken) tokenData.deviceToken = payloadData.deviceToken

            tokenData = await TokenManager.setToken(tokenData);

            delete data.userId.password;
            return {
                ...data.userId,
                userType: data.userType,
                accessToken: tokenData.accessToken,
              
            }
        }
    } catch (error) {
        throw error;
    }
}

async function verifyOtp(payloadData) {

    const criteria = {
        phoneNumber: payloadData.phoneNumber
    };

    const populate = {
        path: 'userId', select: { tokens: 0, password: 0 }
    }

    const data = await Service.findOneAndPopulate(Modal.Roles, criteria, {}, { lean: true }, populate);
    if (!data)
        return Promise.reject(generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE));
    else if (data && data.userId.otp !== payloadData.otp) {
        return Promise.reject(generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OTP));
    } else if (data && ((+new Date() - data.otpSentAt) / 60000) > 5) {
        return Promise.reject(generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OTP));
    }
    else {
        await Service.findAndUpdate(Modal[data.onModel], criteria, { otp: "" }, { lean: true });

        let tokenData = {
            userType: data.userType,
            userId: data.userId._id,
        };

        if (payloadData.deviceId) tokenData.deviceId = payloadData.deviceId
        if (payloadData.deviceToken) tokenData.deviceToken = payloadData.deviceToken

        tokenData = await TokenManager.setToken(tokenData);
        delete data.userId.otp

        return {
            ...data.userId,
            userType: data.userType,
            deviceId: payloadData.deviceId || '',
            deviceToken: payloadData.deviceToken || '',
            accessToken: tokenData.accessToken,
            imageBaseUrl: s3BucketCredentials.s3URL
        };
    }
}


async function changePassword(payloadData, userData) {

    if (payloadData.oldPassword === payloadData.newPassword) {
        throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD, payloadData.language);
    }
    else if (!await comparePassword(payloadData.oldPassword, userData.password)) {
        throw generateResponseMessage(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_OLD_PASSWORD, payloadData.language);
    }
    else {
        const model = findModel(userData.userType);
        let setQuery = {
            password: await CryptData(payloadData.newPassword)
        };
        await Service.findAndUpdate(model, { _id: userData._id, }, setQuery, {});
        return {}
    }
}

async function listData(payloadData){

    const criteria = {
        status : APP_CONSTANTS.DATABASE.STATUS.ACTIVE
    };
    if(payloadData.categoryId) criteria.categoryId = payloadData.categoryId
    
    let model;
    switch(payloadData.type){
            case 1:{
                model = Modal.Categories;
                break;
            }
            case 2:{
                model = Modal.SubCategories
                break;
            }
    }

    return await Service.getData(model,criteria, {},{lean:true})
}

module.exports = {
    forgotPassword: forgotPassword,
    updatePassword: updatePassword,
    changePassword: changePassword,

    loginCheck: loginCheck,
    verifyOtp: verifyOtp,
    listData : listData,

    
};
