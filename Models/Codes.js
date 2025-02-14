
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const Codes = new Schema({

    type  :{type: Number, index: true, default : APP_CONSTANTS.DATABASE.CODE_TYPE.LCD},
    code  :{type: String, index: true},
    companyId : {type: Schema.Types.ObjectId, ref: 'Company', index: true},
    description  :{type: String},
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    lastUpdateBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
},{
    timestamps : true
});

module.exports = mongoose.model('Codes', Codes);




