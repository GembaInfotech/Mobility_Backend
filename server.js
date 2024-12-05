const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Config = require('./Config');
const Routes = require('./Routes');
const Plugins = require('./Plugins');
const BootStrap = require('./Utils/BootStrap');
const { logger } = require('./Lib/LoggerManager');
const Inert = require('@hapi/inert'); 


const init = async () => {
  const server = Hapi.server({
    port: Config.dbConfig.config.PORT,
    routes: { cors: true }
  });

  await server.register(Plugins);


  server.validator(Joi);
  server.route(Routes);
  await server.register(Inert); 

  server.route([
    {
        method: 'GET',
        path: '/bucket/{param*}',
        handler: {
            directory: {
                path: Config.APP_CONSTANTS.SERVER.SERVER_STORAGE_NAME,
                redirectToSlash: true
            }
        }
    }
]);

  server.events.on('response', (request, response) => {
    logger.info(request.info.remoteAddress + ': ' + request.method.toUpperCase() +
      ' ' + request.url.pathname + ' --> ' + request.response.statusCode);

    request.payload ? console.log('Request payload:', request.payload) : console.log('Request payload:', request.query)
  });

  try {
    await Promise.all([
      server.start(),
      BootStrap.dbConnect()
    ])
    BootStrap.bootstrapAdmin()
    logger.info('Server running at:', server.info.uri);
  } catch (err) {
    logger.warn(err);
  }
};

process.on('unhandledRejection', (err) => {
  logger.warn(err);
  process.exit(1);
});

init();