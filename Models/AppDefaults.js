
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AppDefaults = new Schema({

    privacyPolicy :{type: String},
    termsConditions :{type: String}
},{
    timestamps : true
});

module.exports = mongoose.model('AppDefaults', AppDefaults);




