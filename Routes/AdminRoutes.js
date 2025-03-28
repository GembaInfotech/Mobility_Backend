"use strict";

const AdminController = require('../Controllers').AdminController;
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');
const CommonController = require('../Controllers/CustomerController');
const { ExportController } = require('../Controllers');

module.exports = [

    {
        method: 'POST',
        path: '/api/uploadFileStorage',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await UniversalFunctions.uploadFileStorage(request.payload.image, 'others/'))
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'upload data',
            tags: ['api', 'user'],
            payload: {
                maxBytes: 100000000,
                parse: true,
                timeout: false,
                output: 'file',
                multipart: true
            },
            validate: {
                payload: {
                    image: Joi.any().meta({ swaggerType: 'file' }).description('media file').required(),
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/login',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.ipAddress = request.info.remoteAddress;
                    request.payload.userAgent = request.headers['user-agent'];
                    request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await AdminController.adminLogin(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'admin login api',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    email: Joi.string().trim().lowercase(),
                    password: Joi.string().trim(),
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/blockDeleteData',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.blockDeleteData(request.payload, userData))
                }
                catch (e) {
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'block delete Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    id: Joi.string().trim().required(),
                    type: Joi.number().description(`1- deviceType, 2- Location, 3- LCD/ICD code,
                        4 Admins, 5- patient, 6- physican`).required(),
                    status: Joi.number().description(`DELETED: 0,
                    ACTIVE: 1,
                    INACTIVE: 2`)
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/exportData',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await ExportController.exportData(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }

            },
            description: 'export Data',
            auth: 'AdminAuth',
            tags: ['api'],
            validate: {
                payload: {
                    type : Joi.number().required().description('1- Service order,'),
                    startDate : Joi.string().description('MM/DD/YYYY').required(),
                    endDate : Joi.string().description('MM/DD/YYYY').required(),
                    userId : Joi.string()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'POST',
        path: '/admin/addEditAdmins',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.addEditSubAdmin(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: ' add Edit sub admin Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            payload: {
                maxBytes: 100000000,
                parse: true,
                timeout: false,
                output: 'file',
                multipart: true
            },
            validate: {
                payload: {
                    adminId: Joi.string().trim().description('for edit only'),
                    userCode: Joi.string(),
                    roles: Joi.string(),
                    name: Joi.string(),
                    email: Joi.string().lowercase(),
                    countryCode: Joi.string(),
                    phoneNumber: Joi.string(),
                    superAdmin: Joi.boolean(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditInsurance',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.addEditInsurance(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: ' add Edit insurance Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    id: Joi.string().trim().description('for edit only'),
                    name: Joi.string(),
                    email: Joi.string().lowercase(),
                    countryCode: Joi.string(),
                    phoneNumber: Joi.string(),
                    address: Joi.string(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },  

    {
        method: 'POST',
        path: '/admin/importData',
        config: {
            handler: async function (request, h) {
                try {
                    const userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await AdminController.importData(request.payload,userData))
                }
                catch (e) {
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'import',
            tags: ['api'],
            auth: 'AdminAuth',
            payload: {
                maxBytes: 100000000,
                parse: true,
                timeout: false,
                output: 'file',
                multipart: true
            },
            validate: {
                payload: {
                    type : Joi.number().required().description(`1- Codes, 2- Insurances`),
                    file : Joi.any().meta({ swaggerType: 'file' }).description('xlsx file').required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    
    {
        method: 'GET',
        path: '/admin/listData',
        config: {
            handler: async function (request, h) {
                const userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.listData(request.query, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: ' list Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                query: {
                    type : Joi.number().required().description('1- deviceType, 2- Location, 3- LCD/ICD code'),
                    id: Joi.string().trim().description('for single data only'),
                    search: Joi.string().allow(''),
                    patientDob : Joi.string().allow(''),
                    codeType : Joi.number(),
                    status: Joi.number(),
                    limit: Joi.number(),
                    skip: Joi.number(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/admin/dashboard',
        config: {
            handler: async function (request, h) {
                const userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.dashboardData(request.query, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'dashboard Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                // query: {
                   
                // },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/admin/prescriptions',
        config: {
            handler: async function (request, h) {
                const userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.prescriptions(request.query, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'prescriptions Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                query: {
                    id : Joi.string(),
                    skip : Joi.number(),
                    limit : Joi.number(),
                    status  : Joi.number(),
                    search : Joi.string().allow(''),
                    patientId : Joi.string().allow(''),
                    patientDob : Joi.string().allow(''),
                    startDate : Joi.string().allow(''),
                    endDate : Joi.string().allow(''),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditPrescription',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.addEditPrescription(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'add Edit patient Prescription',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            payload: {
                maxBytes: 100000000,
                parse: true,
                timeout: false,
                output: 'file',
                multipart: true
            },
            validate: {
                payload: {
                    id: Joi.string().trim().description('for edit only'),
                    patientId: Joi.string(),
                    physicianId: Joi.string(),
                    renderingPhysicianId: Joi.string(),
                    locationId: Joi.string(),
                    appointmentLocationId: Joi.string(),
                    physicianNotes: Joi.boolean(),
                    prescriptions: Joi.string(),
                    insuranceType : Joi.number(),
                    orderStatus : Joi.number(),
                    nextAppointmentDate : Joi.string(),
                    primaryInsurance : Joi.string(),
                    secondaryInsurance : Joi.string(),
                    primaryInsuranceNo : Joi.string().allow(''),
                    secondaryInsuranceNo : Joi.string().allow(''),
                    prescriptionDocument: Joi.any().meta({ swaggerType: 'file' }),
                    insuranceDocument: Joi.any().meta({ swaggerType: 'file' }),
                    notes: Joi.string().allow(''),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/generatePdf',
        config: {
            handler: async function (request, h) {
                // request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                // let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.generatePdf(request.payload, {}))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'add Edit generate Pdf',
            // auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    type: Joi.number().description('1- medical neccesity,2- delivery receipt'),
                    data : Joi.any()
                },
                // headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditPatient',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.addEditPatient(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: ' add Edit patient Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    id: Joi.string().trim().description('for edit only'),
                    firstName: Joi.string(),
                    lastName: Joi.string(),
                    email: Joi.string().lowercase(),
                    countryCode: Joi.string().default('+1'),
                    phoneNumber: Joi.string(),
                    naspacNo : Joi.string(),
                    dob: Joi.string(),
                    primaryInsurance: Joi.string(),
                    primaryInsuranceNo: Joi.string().allow(''),
                    secondaryInsurance: Joi.string(),
                    secondaryInsuranceNo: Joi.string().allow(''),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
   
    {
        method: 'POST',
        path: '/admin/addEditPhysician',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.addEditPhysician(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: ' add Edit physician Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    id: Joi.string().trim().description('for edit only'),
                    name: Joi.string(),
                    email: Joi.string().lowercase(),
                    countryCode: Joi.string().default('+1'),
                    phoneNumber: Joi.string(),
                    address: Joi.string(),
                    fax: Joi.string(),
                    npiNo: Joi.string(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/addEditData',
        config: {
            handler: async function (request, h) {
                request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(null, await AdminController.addEditData(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }

            },
            description: ' add Edit Data',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    modelType: Joi.number().required().description('1- deviceType, 2- Location, 3- LCD/ICD code'),
                    id: Joi.string().trim().description('for edit only'),
                    type: Joi.string(),
                    name: Joi.string(),
                    code: Joi.string(),
                    description: Joi.string().allow(''),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/admin/logout',
        config: {
            handler: async function (request, h) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                userData.deviceId = request.payload.deviceId;
                try {
                    return UniversalFunctions.sendSuccess(null, await UniversalFunctions.logout(userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'logout',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    deviceId: Joi.string().default('321'),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/changePassword',
        config: {
            handler: async function (request, h) {
                let userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
                userData.deviceId = request.payload.deviceId;
                try {
                    return UniversalFunctions.sendSuccess(null, await CommonController.changePassword(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'change pass',
            auth: 'AdminAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    oldPassword: Joi.string().required(),
                    newPassword: Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }

];
