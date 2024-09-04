const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {APP_CONSTANTS} = require('../Config');

const Inventory = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    storeManager: { type: String, required: true },
    status :{type: Number, default : APP_CONSTANTS.DATABASE.STATUS.ACTIVE},
    lastUpdateBy : {type: Schema.Types.ObjectId, ref: 'Admins'},
}, {
    timestamps: true
});

module.exports = mongoose.model('Inventory', Inventory);