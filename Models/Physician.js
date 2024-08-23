
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {DATABASE} = require('../Config/AppConstants');

const Physicians = new Schema({

    name : {type: String, trim: true, index: true},
    email: {type: String, trim: true},
    password: {type: String},
    countryCode: {type: String,default : "+1"},
    phoneNumber: {type: String,index : true},
    address : {type: String},
    fax : {type: String},
    npiNo : {type: String},
    status : {type: Number, default: DATABASE.STATUS.ACTIVE,index:true},

},{
    timestamps : true
});

module.exports = mongoose.model('Physicians', Physicians);




