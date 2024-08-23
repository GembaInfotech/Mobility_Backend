const mongoose = require('mongoose');
const Config = require('../Config');
const Modal = require('../Models');
mongoose.Promise = global.Promise;
const Service = require('../Services').queries;
const { logger } = require('../Lib/LoggerManager');

exports.dbConnect = async function () {
    const { config } = Config.dbConfig;
    await mongoose.connect(config.dbURI);
    logger.info('MongoDB Connected');
}

exports.bootstrapAdmin = async function () {
    const adminData = [
        {
            email: 'admin@gmail.com',
            name: 'Admin',
        },
        {
            email: 'admin1@gmail.com',
            name: 'Admin',
        }
    ];
    const data = [];

    for (const [index, key] of adminData.entries()) {

        const update = {
            $set: key,
            $setOnInsert: {
                password: '$2b$10$92S9CRtH2IhCrOzPBib.Pu3VVDB6NkHINi6DUnZIUe2.19Gpm2BLK', // qwerty
                status: Config.APP_CONSTANTS.DATABASE.STATUS.ACTIVE,
                roles: [],
                superAdmin: true,
                phoneNumber: '987654321' + index,
            }
        };
        data.push(Service.findAndUpdate(Modal.Admins, { email: key.email }, update, { upsert: true }));
    }

    await Promise.all(data);
};

exports.bootstrapAppVersion = async function () {
    const appVersion = {
        latestIOSVersion: 1,
        criticalIOSVersion: 1,
        latestAndroidVersion: 1,
        criticalAndroidVersion: 1,
        appType: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
    };

    const criteria = {
        appType: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
    };
    await Service.update(Modal.AppVersions, criteria, appVersion, { upsert: true });
};
