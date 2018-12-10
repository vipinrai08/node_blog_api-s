var mongoose = require('mongoose');
var modelWrapper = require('./modelwrapper').modelWrapper;
pageSchema = modelWrapper({
    _id: mongoose.Schema.Types.ObjectId,

  title: { type: String, required: true},
  
  description: { type: String, required: true},
  
  active: { type: Boolean ,required: true}

}, {versionKey: false});
module.exports = mongoose.model('Page', pageSchema);