var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  ingredients: [
    {
      type: Object,
      required: false
    }
  ],

  name: {
    type: String,
    required: true
  },

  servings: {
    type: Number,
    required: true,
    default: 1
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
