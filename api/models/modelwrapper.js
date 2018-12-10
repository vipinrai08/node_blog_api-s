var mongoose = require('mongoose');

function modelWrapper(schemaObject, options) {
    return mongoose.Schema(schemaObject, options);
}

module.exports = {
    modelWrapper
}