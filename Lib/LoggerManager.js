const bunyan = require('bunyan');

const logger = bunyan.createLogger({name: "SML App"});

module.exports =  {
    logger
};
