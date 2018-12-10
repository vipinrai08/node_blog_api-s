var mongoose = require('mongoose');
var modelWrapper = require('./modelwrapper').modelWrapper;

profilesettingSchema = modelWrapper({
    _id: mongoose.Schema.Types.ObjectId,

 oldpassword: { type: String, required: true},
  newpassword:{ type: String, required: true}
}, {versionKey: false});
module.exports = mongoose.model('ProfileSetting', profilesettingSchema);