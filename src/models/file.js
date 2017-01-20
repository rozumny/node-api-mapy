var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({ type: Schema.Types.Mixed }, { strict: false });

module.exports = mongoose.model('File', FileSchema);