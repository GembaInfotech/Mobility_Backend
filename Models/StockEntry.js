const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { APP_CONSTANTS } = require('../Config');

const StockEntry = new Schema({
    stockType: { type: String, required: true },
    stockType: { type: Number, default: APP_CONSTANTS.DATABASE.STOCK_TYPE.MATERIAL_RECEIPT },
    stockNo: {type: String, trim: true, index: true},
    materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
    quantity: { type: Number, required: true },
    uomId: { type: Schema.Types.ObjectId, ref: 'UOM'},
    warehouseId: { type: Schema.Types.ObjectId, ref: 'InvLocations'},
    status: { type: Number, default: APP_CONSTANTS.DATABASE.STATUS.ACTIVE },
    lastUpdateBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
}, {
    timestamps: true
});

module.exports = mongoose.model('StockEntry', StockEntry);

