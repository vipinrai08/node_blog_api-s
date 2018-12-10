var mongoose = require('mongoose');
var modelWrapper = require('./modelwrapper').modelWrapper;
var Tag = require('./tag');

postSchema = modelWrapper({
    _id: mongoose.Schema.Types.ObjectId,

 title: { type: String, required: true},
 
  content: { type: String},

  image: { type: String},

  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]

}, {versionKey: false});

module.exports = mongoose.model('Post', postSchema);