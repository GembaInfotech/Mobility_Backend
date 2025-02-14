
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const DeviceTypes = new Schema({

    name :{type: String},
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    companyId : {type: Schema.Types.ObjectId, ref: 'Company', index: true},
    lastUpdateBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
},{
    timestamps : true
});

module.exports = mongoose.model('DeviceTypes', DeviceTypes);




