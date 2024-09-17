const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { APP_CONSTANTS } = require('../Config');

const Material = new Schema({
    material: { type: String, required: true },
    materialNo:{type: String, trim: true, index: true},
    type: { type: String, required: true },
    group: { type: String, required: true },
    code: { type: String, required: true },
    uomId : {type: Schema.Types.ObjectId, ref: 'UOM', sparse : true},
    status: { type: Number, default: APP_CONSTANTS.DATABASE.STATUS.ACTIVE },
    description: { type: String, required: true },
    lastUpdateBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admins' },
}, {
    timestamps: true
});

module.exports = mongoose.model('Material', Material);

