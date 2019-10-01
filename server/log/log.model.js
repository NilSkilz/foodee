var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LogSchema = new Schema({
  _id: {
    type: Schema.ObjectId,
    required: true,
    default: new mongoose.Types.ObjectId()
  },

  message: {
    type: String,
    required: false
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },

  created_at: {
    type: Date,
    required: true,
    default: () => new Date()
  }
});

module.exports = mongoose.model('Log', LogSchema);
