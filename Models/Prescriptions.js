
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const Prescriptions = new Schema({

    orderNo :{type: String, index: true},
    patientId : {type: Schema.Types.ObjectId, ref: 'Patients', index: true},
    physicianId : {type: Schema.Types.ObjectId, ref: 'Physicians', index : true},
    renderingPhysicianId : {type: Schema.Types.ObjectId, ref: 'Physicians', index : true},
    locationId : {type: Schema.Types.ObjectId, ref: 'Locations', sparse : true},
    appointmentLocationId : {type: Schema.Types.ObjectId, ref: 'Locations', sparse : true},
    companyId: {type: Schema.Types.ObjectId, ref: 'Company', sparse : true},
    nextAppointmentDate :{type: Date},
    physicianNotes :{type: Boolean, default: false},
    insuranceType :{type: Number, default : APP_CONSTANTS.DATABASE.INSURANCE_TYPE.SELF_PAY},
    prescriptions : [{
            deviceType : {type: Schema.Types.ObjectId, ref: 'DeviceTypes'},
            icdCode : [{type: Schema.Types.ObjectId, ref: 'Codes'}],
            lCode : {type: Schema.Types.ObjectId, ref: 'Codes'},
            quantity : {type: Number},
            segment : {type: Number},
    }],
    prescriptionDocument :{
       
    },
    insuranceDocument :{
       
    },
    orderStatus : {type: Number, default: APP_CONSTANTS.DATABASE.ORDER_STATUS.REFERRAL_SENT},
    addComment: {type:String},
    notes :{type: String},
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    commentAddedBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
},{
    timestamps : true
});

module.exports = mongoose.model('Prescriptions', Prescriptions);




