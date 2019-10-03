var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MetricSchema = new Schema({
  // _id: {
  //   type: Schema.ObjectId,
  //   required: true,
  //   default: new mongoose.Types.ObjectId()
  // },

  type: {
    type: String,
    required: true
  },

  value: {
    type: Number,
    required: true
  },

  created_at: {
    type: Date,
    required: true,
    default: () => new Date()
  }
});

module.exports = mongoose.model('Metric', MetricSchema);
