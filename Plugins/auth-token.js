const UniversalFunctions = require('../Utils/UniversalFunction');
const TokenManager = require('../Lib/TokenManager');
const Config = require('../Config');
const { DATABASE } = require('../Config/AppConstants');

function sendResponse(response, token, headers = {}) {
    if (response) {
        if(response.status === DATABASE.STATUS.ACTIVE) {
            const isValid = true;
            response.language = headers.language || DATABASE.APP_LANGUAGE.English;
            response.accessToken = token;
            const credentials = { userData: response };
            const artifacts = { token };

            return { isValid, credentials, artifacts };
        }
        else {
            return Promise.reject(UniversalFunctions.sendError(
                UniversalFunctions.generateResponseMessage(
                    Config.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED
                )
            ));
        } 
    }
    else  return Promise.reject(UniversalFunctions.sendError(
        UniversalFunctions.generateResponseMessage(
            Config.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED
        )
    ));
}

exports.plugin = {
    name: 'auth-token-plugin',
    register: async (server, options) => {
        server.register(require('hapi-auth-bearer-token'));

        const authStrategy = {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validate: async (request, token, h) => {
                if (token === 'guest') {
                    let isValid = true, credentials = { userData: { language: request.headers.language || DATABASE.APP_LANGUAGE.English } };
                    token = {};
                    return { isValid, credentials, token };
                }
                let userType = DATABASE.USER_TYPE.SUPER_ADMIN;
               
                switch (request.route.settings.tags[1]) {
                    case 'customer':
                        userType = DATABASE.USER_TYPE.CUSTOMER;
                        break;
                }

                const response = await TokenManager.verifyToken(token, userType);
                return sendResponse(response, userType, token);
            }
        };

        server.auth.strategy('AdminAuth', 'bearer-access-token', authStrategy);
        server.auth.strategy('CustomerAuth', 'bearer-access-token', authStrategy);
    }
};
