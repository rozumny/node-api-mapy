var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({ type: Schema.Types.Mixed }, { strict: false });

module.exports = mongoose.model('Admin', UserSchema);