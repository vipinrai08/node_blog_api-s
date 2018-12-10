
var mongoose = require('mongoose');
var modelWrapper = require('./modelwrapper').modelWrapper;

var adminSchema =modelWrapper({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password:{
      type: String,
      passwordResetToken: String,
      passwordResetExpires: Date,
      required: true,
  },
}, { versionKey: false });
var admin = mongoose.model('Admin', adminSchema);

module.exports = admin;