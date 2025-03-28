
'use strict';

/*
* db.createUser(
{
user: "admin",
pwd: "SOmpFpCAuZa6D5QXkh",
roles: [ { role: "root", db: "admin" } ]
}
)
*
* */

switch (process.env.NODE_ENV) {

    case 'dev':{
        exports.config = {
            PORT : 8000,
            dbURI : 'mongodb://adminUser:Gemba123@103.171.96.154/admin',
            swaggerName : 'Dev APIs'
        };
        break;
    }
    case 'live':{
        exports.config = {
            PORT : 8001,
            dbURI : 'mongodb://mobilityliveUser:Gemba321@103.171.96.154/mobilitylive',
            swaggerName : 'Live APIs',
            paymentURI : ''
        };
        break;
    }
    case 'local':{
        exports.config = {
            PORT : 8000,
            dbURI : 'mongodb://localhost:27017/naspDev',
            swaggerName : 'Local APIs',
        };
        break;
    }
}
