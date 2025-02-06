const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const Company = new Schema({

    name :{type: String},
    companyNo:{type: String, trim: true, index: true},
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    lastUpdateBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
},{
    timestamps : true
});

module.exports = mongoose.model('Company', Company);




