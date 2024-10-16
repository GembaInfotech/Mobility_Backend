const Joi = require('joi');

const SERVER = {
    JWT_SECRET_KEY: 'MaEHqzXzdWrCEROLWS6TS',
    OTP_MESSAGE : 'Welcome to ! Please enter the following OTP {otp} to verify your account.',
    CRYPTO_SECRET : 'cuZHAoet7Ds7ADhL',
    OTP_SUBJECT : 'Welcome to verification!',
    SERVER_STORAGE_NAME : process.env.NODE_ENV === 'local' ? './Uploads/' : '/home/MIHdevteam/rawData/'
};

const DATABASE = {
    APP_LANGUAGE : {
      'English' : "en",
      'Hindi' : "hi"
    },
    DEVICE_TYPES: {
        IOS: 'IOS',
        ANDROID: 'ANDROID'
    },
    CODE_TYPE: {
        LCD: 1,
        ICD: 2,
    }, 
    INSURANCE_TYPE : {
        SELF_PAY : 1,
        FROM_INSURER : 2,
    },
    STOCK_TYPE : {
        MATERIAL_RECEIPT : 1,
        MATERIAL_TRANSFER : 2,
    },
    SEGMENT_CONSTANT : {
        "Left" : 1 ,
        "Right" : 2 ,
        "Spine" : 3 ,
        "Bilateral" : 4 ,
    },
    STATUS: {
        DELETED: 0,
        ACTIVE: 1,
        INACTIVE: 2
    },
    USER_TYPE: {
        SUPER_ADMIN: 1,
        CUSTOMER: 2
    }, 
    ORDER_STATUS: {
        REFERRAL_SENT: 1,
        IN_TAKE_COMPLETED: 2,
        INSURANCE_COMPLETED: 3,
        ORDER_FULLFILMENT_IN_PROCESS: 4,
        ORDER_FULLFILMENT_COMPLETED: 5,
        DELIVERY_READY: 6,
        DELIVERED: 7,
        DR_SENT_TO_PPS: 8,
        BILLED: 9,
        RNR: 10,
        DENIED: 11,
    },
    MEDIA_UPLOAD_TYPE : {
        ORDERS : 1,
        USERS : 2,
        OTHERS : 3,
    },
    NOTIFICATION_TYPE: {
        TRIP_UPDATES : 1,
        TRIP_ASSIGNED : 2,
        TRIP_ISSUE_HALT : 3,
        DRIVER_LICENSE_END : 4,
        TRANSPORTER_AGGREMENT_END : 5,
    },

};

const STATUS_MSG = {
    ERROR: {
        TOKEN_EXPIRED: {
            statusCode: 401,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Sorry, your account has been logged in other device! Please login again to continue.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Sorry, your account has been logged in other device! Please login again to continue.',
            },
            type: 'TOKEN_ALREADY_EXPIRED'
        },
        BLOCKED: {
            statusCode: 401,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'This account is blocked by Admin. Please contact support team to activate your account.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'This account is blocked by Admin. Please contact support team to activate your account.',
            },
            type: 'BLOCKED'
        },
        DB_ERROR: {
            statusCode: 400,
            customMessage: 'DB Error : ',
            type: 'DB_ERROR'
        },
        API_TOKEN_REQUIRED: {
            statusCode: 400,
            customMessage: 'Api Token is missing!',
            type: 'API_TOKEN_REQUIRED'
        },
        INVALID_API_TOKEN: {
            statusCode: 400,
            customMessage: 'Unauthorized! Invalid Api Token',
            type: 'INVALID_API_TOKEN'
        },

        CANT_CANCEL : {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'You can\'t cancel the booking before {time} minutes of the event',
                [DATABASE.APP_LANGUAGE.Arabic] : 'You can\'t cancel the booking before {time} minutes of the event',
            },
            type: 'CANT_CANCEL'
        },
        INSUFFICIENT_AMOUNT: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Your wallet amount is less than the booking amount',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Your wallet amount is less than the booking amount',
            },
            type: 'INSUFFICIENT_AMOUNT'
        },
        INVALID_PASSWORD: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Password you have entered does not match.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Password you have entered does not match.',
            },
            type: 'INVALID_PASSWORD'
        },
        INVALID_OLD_PASSWORD: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Current password you have entered does not match.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Current password you have entered does not match.',
            },
            type: 'INVALID_OLD_PASSWORD'
        },
        ALREADY_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Email address you have entered is already registered with us.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Email address you have entered is already registered with us.',
            },
            type: 'ALREADY_EXIST'
        },
        ALREADY_VERIFY: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Your account is already verified.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Your account is already verified.',
            },
            type: 'ALREADY_VERIFY'
        },
        EMAIl_ALREADY_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Email address you have entered is already registered with us.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Email address you have entered is already registered with us.',
            },
            type: 'ALREADY_EXIST'
        },
        DRIVER_LICENSE_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Driving License you have entered is already registered with us.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Driving License you have entered is already registered with us.',
            },
            type: 'DRIVER_LICENSE_EXIST'
        },
        AADHAR_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Aadhar No. you have entered is already registered with us.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Aadhar No. you have entered is already registered with us.',
            },
            type: 'AADHAR_EXIST'
        },
        EMAIl_PHONE_ALREADY_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Email address or phone number you have entered is already registered with us.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Email address or phone number you have entered is already registered with us.',
            },
            type: 'ALREADY_EXIST'
        },
       
        PHONE_ALREADY_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Phone number you have entered is already registered with us.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Phone number you have entered is already registered with us.',
            },
            type: 'PHONE_ALREADY_EXIST'
        },
        NAME_ALREADY_EXIST: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'The name already exists.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'The name already exists.',
            },
            type: 'NAME_ALREADY_EXIST'
        },
        ALREADY_FULL: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Event is already full with all players.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Event is already full with all players.',
            },
            type: 'ALREADY_FULL'
        },
        IMP_ERROR: {
            statusCode: 500,
            customMessage: 'Implementation error',
            type: 'IMP_ERROR'
        },
        FILE_ISSUE_ERROR: {
            statusCode: 500,
            customMessage: 'Some issue with the file',
            type: 'FILE_ISSUE_ERROR'
        },
        APP_ERROR: {
            statusCode: 400,
            customMessage: 'Application Error',
            type: 'APP_ERROR'
        },
        INVALID_ID: {
            statusCode: 400,
            customMessage: 'Invalid Id Provided : ',
            type: 'INVALID_ID'
        },
        DUPLICATE: {
            statusCode: 400,
            customMessage: 'Duplicate Entry',
            type: 'DUPLICATE'
        },
        USERNAME_INVALID: {
            statusCode: 400,
            customMessage: 'Username you have entered does not match.',
            type: 'USERNAME_INVALID'
        },
        INVALID_EMAIL: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'The email address you have entered does not match.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'The email address you have entered does not match.'
            },
            type: 'INVALID_EMAIL'
        },
        INVALID_PHONE: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'The phone number you have entered does not match.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'The phone number you have entered does not match.'
            },
            type: 'INVALID_EMAIL'
        },
        INVOICE_ERROR: {
            statusCode: 400,
            customMessage: 'Invoice not Found.',
            type: 'INVOICE_ERROR'
        },
        ALREADY_CANCEL: {
            statusCode: 400,
            customMessage: 'This request has been already cancelled by the user.',
            type: 'ALREADY_CANCEL',
        },
        INVALID_TOKEN: {
            statusCode: 400,
            customMessage: 'The token you have entered does not match.',
            type: 'INVALID_TOKEN'
        },
        SAME_PASSWORD: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'New password can\'t be same as Old password.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'New password can\'t be same as Old password.',
            },
            type: 'SAME_PASSWORD'
        },
        INCORRECT_OLD_PASSWORD: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Old password you have entered does not match.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Old password you have entered does not match.',
            },
            type: 'INCORRECT_OLD_PASSWORD'
        },
        INCORRECT_OTP: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Otp you have entered does not match.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Otp you have entered does not match.',
            },
            type: 'INCORRECT_OTP'
        },

        OTP_EXPIRED: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English] : 'Passcode has expired.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Passcode has expired',
            },
            type: 'OTP_EXPIRED'
        },
        NOT_EXIST: {
            statusCode: 400,
            customMessage: 'You have not registered yet.',
            type: 'NOT_EXIST'
        },
        NOT_APPROVED: {
            statusCode: 400,
            customMessage: 'Your profile is not approved by admin.',
            type: 'NOT_APPROVED'
        },
        NOT_AUTHORISED: {
            statusCode: 400,
            customMessage: {
                [DATABASE.APP_LANGUAGE.English]  : 'You are not authorised to this action.',
                [DATABASE.APP_LANGUAGE.Arabic]  : 'You are not authorised to this action.',
            },
            type: 'NOT_AUTHORISED'
        }

    },
    SUCCESS: {
        CREATED: {
            statusCode: 200,
            customMessage: 'Created Successfully',
            type: 'CREATED'
        },
        DEFAULT: {
            statusCode: 200,
            customMessage: 'Success',
            type: 'DEFAULT'
        },
        UPDATED: {
            statusCode: 200,
            customMessage: 'Updated Successfully',
            type: 'UPDATED'
        },
        LOGOUT: {
            statusCode: 200,
            customMessage: 'Logged Out Successfully',
            type: 'LOGOUT'
        },
        DELETED: {
            statusCode: 200,
            customMessage: 'Deleted Successfully',
            type: 'DELETED'
        },
        REGISTER: {
            statusCode: 200,
            customMessage: 'Register Successfully',
            type: 'REGISTER'
        },
        PLEAS_CHECK_EMAIL: {
            statusCode: 200,
            customMessage:{
                [DATABASE.APP_LANGUAGE.English] : 'Please check your email for further instructions.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Please check your email for further instructions.',
            },
            type: 'PLEAS_CHECK_EMAIL'
        },
        RESET_OTP_DONE: {
            statusCode: 200,
            customMessage:{
                [DATABASE.APP_LANGUAGE.English] : 'Passcode has been sent to your email',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Passcode has been sent to your email',
            },
            type: 'RESET_OTP_DONE'
        },
        REPORT_SUCCESS: {
            statusCode: 200,
            customMessage:{
                [DATABASE.APP_LANGUAGE.English] : 'Thanks for letting us know. It will be reviewed by our team shortly.',
                [DATABASE.APP_LANGUAGE.Arabic] : 'Thanks for letting us know. It will be reviewed by our team shortly.',
            },
            type: 'REPORT_SUCCESS'
        },
    }
};

const swaggerDefaultResponseMessages = {
    '200': {'description': 'Success'},
    '400': {'description': 'Bad Request'},
    '401': {'description': 'Unauthorized'},
    '404': {'description': 'Data Not Found'},
    '500': {'description': 'Internal Server Error'}
};

const FOLDER_PATH = (type) => {
    
    switch (type) {
        case  DATABASE.MEDIA_UPLOAD_TYPE.ORDERS:
            return `orders/`;
        case  DATABASE.MEDIA_UPLOAD_TYPE.USERS:
            return `users/`;
        default:
            return `others/`;
    }
}

let APP_CONSTANTS = {
    FOLDER_PATH,
    SERVER: SERVER,
    DATABASE: DATABASE,
    STATUS_MSG: STATUS_MSG,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
};

module.exports = APP_CONSTANTS;