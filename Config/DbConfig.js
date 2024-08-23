
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
            dbURI : 'mongodb://naspDev:OJb3ss7281Tl9TW@74.235.98.55/naspDev',
            swaggerName : 'Dev APIs'
        };
        break;
    }
    case 'live':{
        exports.config = {
            PORT : 8001,
            dbURI : 'mongodb://naspLive:OJb3ss7281Tl9TW@localhost/naspLive',
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
