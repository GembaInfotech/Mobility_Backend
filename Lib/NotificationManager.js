'use strict';

const FCM = require('fcm-node');
const { logger } = require('./LoggerManager');
const { awsS3Config } = require('../Config');
const serverKeyUser = `AAAAFWXgDBc:APA91bECi-XqIFJa0A8kLoJwKDFYrHn7c7YEJ6L136MIrjvbKCVDSPTJS8AtQwtxbLIXW3facoFv_MlojF1QcTFN32ZJknaGaTFXjUXEwvGHOS2oXrzdGM4j-q4RWMGWdJNsTrstqzZx`
const userFcm = new FCM(serverKeyUser);

const sendPush = (deviceTokens, data) => {
    data.icon =  `${awsS3Config.s3BucketCredentials.s3URL}others/thumbs/Other_media_Frame 1000003784 (1)_thumb_129360017839.png`;

    const message = {
        registration_ids: [...deviceTokens],
        notification: {
            ...data,
            title: 'Vahan Suraksha',
            sound: "default",
            badge: 1,
        },
        data,
        priority: 'high'
    };
    if(data.description) message.notification.body = data.description
    console.log(message.notification)
    try {
         userFcm.send(message, (err, result) => {
            if (err) {
                logger.info("Something has gone wrong!", err);
            }
            else logger.info("Successfully sent with response: ", result);
           
        });
       
    } catch (err) {
        console.log("Something has gone wrong!", err);
    }
};

module.exports = {
    sendPush
};
