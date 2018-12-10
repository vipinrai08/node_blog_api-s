var mongoose = require('mongoose');

var modelWrapper = require('./modelwrapper').modelWrapper;
categoriesSchema = modelWrapper({
    _id: mongoose.Schema.Types.ObjectId,

 name: { type: String, required: true}
  
}, { versionKey: false});
module.exports = mongoose.model('Categories', categoriesSchema);