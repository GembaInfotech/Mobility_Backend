const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { APP_CONSTANTS } = require('../Config');

const StockEntry = new Schema({
    stockType: { type: Number, default: APP_CONSTANTS.DATABASE.STOCK_TYPE.MATERIAL_RECEIPT },
    companyId : {type: Schema.Types.ObjectId, ref: 'Company', index: true},
    stockNo: {type: String, trim: true, index: true},
    quantity: { type: Number, required: true },
    uomId: { type: Schema.Types.ObjectId, ref: 'UOM'},
    lcodeId: { type: Schema.Types.ObjectId, ref: 'Codes'},
    locationId: { type: Schema.Types.ObjectId, ref: 'Locations'},
    status: { type: Number, default: APP_CONSTANTS.DATABASE.STATUS.ACTIVE },
    lastUpdateBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
}, {
    timestamps: true
});

module.exports = mongoose.model('StockEntry', StockEntry);

