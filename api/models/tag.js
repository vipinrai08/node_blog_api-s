var mongoose = require('mongoose');
var modelWrapper = require('./modelwrapper').modelWrapper;

tagSchema = modelWrapper({
   _id: mongoose.Schema.Types.ObjectId,

 tag: {type: String},

 postId :{type: String}

}, {versionKey: false});
module.exports = mongoose.model('Tag', tagSchema, 'tags');