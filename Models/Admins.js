
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {DATABASE} = require('../Config/AppConstants');

const Admins = new Schema({

    name : {type: String, trim: true, index: true},
    email: {type: String, trim: true, index: true},
    
    companyId: { type: Schema.Types.ObjectId, ref: 'Company'},

    password: {type: String, index : true},
    countryCode: {type: String,default : "+91"},
    phoneNumber: {type: String,index : true},
    superAdmin:{type:Boolean,default : false},
    roles: {type:Array},
    lastLoginAt :{type:Date},
    imageUrl : {
        original  : {type : String,default : ""},
        thumbnail : {type : String,default : ""}
    },
    lastUpdateBy : {type : Schema.ObjectId, ref :'Admins'},
    status : {type: Number, default: DATABASE.STATUS.ACTIVE,index:true},

},{
    timestamps : true
});

module.exports = mongoose.model('Admins', Admins);




