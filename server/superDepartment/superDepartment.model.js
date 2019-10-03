var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SuperDepartmentSchema = new Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model('SuperDepartment', SuperDepartmentSchema);
