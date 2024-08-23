"use strict";

const {CustomerController} = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');

module.exports = [

    {
        method: 'POST',
        path: '/api/uploadFileStorage',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await UniversalFunctions.uploadFileStorage(request.payload.image, 'others'))
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
        path: '/api/login',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.ipAddress = request.info.remoteAddress;
                    request.payload.userAgent = request.headers['user-agent'];

                    request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await CustomerController.loginCheck(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: ' login api',
            tags: ['api'],
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
        path: '/api/verifyOtp',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.ipAddress = request.info.remoteAddress;
                    request.payload.userAgent = request.headers['user-agent'];

                    request.payload.language = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await CustomerController.verifyOtp(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'verify Otp api',
            tags: ['api'],
            validate: {
                payload: {
                    phoneNumber: Joi.string().trim(),
                    otp: Joi.string().trim(),
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
        path: '/api/forgotPassword',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.language  = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await CustomerController.forgotPassword(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'forgot api',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    email: Joi.string().trim().lowercase().required(),
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
        path: '/api/updatePassword',
        config: {
            handler: async function (request, h) {
                try {
                    request.payload.language  = request.headers.language ? request.headers.language : Config.APP_CONSTANTS.DATABASE.APP_LANGUAGE.English;
                    return UniversalFunctions.sendSuccess(null, await CustomerController.updatePassword(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: 'update Password api',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    email : Joi.string().lowercase().required(),
                    password: Joi.string().trim().required(),
                    type : Joi.number().description('for admin send - 2')
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
        method: 'GET',
        path: '/api/listData',
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(null, await CustomerController.listData(request.query))
                }
                catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            tags: ['api', 'customer'],
            validate: {
                query: {
                    type : Joi.number().required().description('1- catgeories, 2- subcat'),
                    categoryId : Joi.string().description('in case of list subcat'),
                    search : Joi.string().allow(''),
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
];
