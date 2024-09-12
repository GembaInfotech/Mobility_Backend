const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const UOM = new Schema({
    uomNo : {type: String, trim: true, index: true},
    name: { type: String, required: true },
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    lastUpdateBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
    createdBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
}, {
    timestamps: true
});

module.exports = mongoose.model('UOM', UOM);