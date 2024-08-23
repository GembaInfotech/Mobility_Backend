
const Pack = require('../package.json');
const {config} = require('../Config').dbConfig;

exports.plugin = {
    name: 'swagger-plugin',
    register: async (server, option) => {
        const swaggerOptions = {
            info: {
                title: `${config.swaggerName} Documentation`,
                version: Pack.version,
            },
            schemes: ["http","https"]
        };

        await server.register([
            require("@hapi/inert"),
            require("@hapi/vision"),
            {
                plugin: require("hapi-swagger"),
                options: swaggerOptions,
            },
        ]);
    }
};
