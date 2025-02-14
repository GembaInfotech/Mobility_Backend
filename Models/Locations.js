
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const Locations = new Schema({

    name :{type: String},
    companyId : {type: Schema.Types.ObjectId, ref: 'Company', index: true},
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    lastUpdateBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
},{
    timestamps : true
});

module.exports = mongoose.model('Locations', Locations);




