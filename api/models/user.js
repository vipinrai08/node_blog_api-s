var mongoose = require('mongoose');
var modelWrapper = require('./modelwrapper').modelWrapper;

userSchema = modelWrapper({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: {
      type: String,
      required: true
  },
  age:{
      type: String,
      required: true
  },
   
  
}, { versionKey: false });

var user = mongoose.model('User', userSchema);

module.exports = user;