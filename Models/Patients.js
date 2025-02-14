
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {DATABASE} = require('../Config/AppConstants');

const Patients = new Schema({

    patientNo : {type: String, trim: true, index: true},
    companyId : {type: Schema.Types.ObjectId, ref: 'Company', index: true},
    firstName : {type: String, trim: true, index: true},
    lastName : {type: String, trim: true, index: true},
    email: {type: String, trim: true, index: true},
    password: {type: String},
    naspacNo: {type: String},
    countryCode: {type: String,default : "+1"},
    phoneNumber: {type: String,index : true},
    dob: {type: Date},
    primaryInsurance: {type: Schema.ObjectId, ref :'InsuranceCompanies'},
    primaryInsuranceNo: {type: String},
    secondaryInsurance: {type: Schema.ObjectId, ref :'InsuranceCompanies'},
    secondaryInsuranceNo: {type: String},
    status : {type: Number, default: DATABASE.STATUS.ACTIVE,index:true},

},{
    timestamps : true
});

module.exports = mongoose.model('Patients', Patients);




