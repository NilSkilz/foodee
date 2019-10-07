var async = require('async');
var mongoose = require('mongoose');
var moment = require('moment');
var Jimp = require('jimp');
var nocr = require('nocr');
var schedule = require('node-schedule');

var Product = require('./product/product.model');
var Recipe = require('./recipe/recipe.model');
var Stock = require('./stock/stock.model');
var Metric = require('./metric/metric.model');

var products = [];
var recipes = [];

// Connect to database
const uri = 'mongodb://127.0.0.1/grocy-dev';

mongoose.connect(uri, {});

var j = schedule.scheduleJob('0 0 0 * * ', function() {
  generateMetrics();
});

generateMetrics = () => {
  async.series(
    [
      populateVariables,

      getProductCount,
      getLowStockCount,
      getOutOfStockCount,
      getInStockCount,

      getRecipeCount,
      getOutOfStockRecipeCount,
      getInStockRecipeCount
    ],
    function(err, results) {
      console.log(err);
      // results is now equal to ['one', 'two']
    }
  );
};

populateVariables = callback => {
  Product.find({})
    .populate({
      path: 'stock',
      match: { consumed_date: { $exists: false } }
    })
    .exec()
    .then(p => {
      Recipe.find({})
        .exec()
        .then(r => {
          products = p;
          recipes = r;
          callback();
        });
    });
};

getProductCount = callback => {
  new Metric({
    type: 'product_count',
    value: products.length
  }).save(callback);
};

getLowStockCount = callback => {
  const lowStock = products.filter(product => product.stock.length < product.minimum_stock);
  new Metric({
    type: 'product_low_stock_count',
    value: lowStock.length
  }).save(callback);
};

getOutOfStockCount = callback => {
  const outOfStock = products.filter(product => product.stock.length === 0);
  new Metric({
    type: 'product_out_of_stock_count',
    value: outOfStock.length
  }).save(callback);
};

getInStockCount = callback => {
  const productsInStock = products.filter(product => product.stock.length > 0);
  new Metric({
    type: 'product_in_stock_count',
    value: productsInStock.length
  }).save(callback);
};

getRecipeCount = callback => {
  new Metric({
    type: 'recipe_count',
    value: recipes.length
  }).save(callback);
};

getOutOfStockRecipeCount = callback => {
  const outOfStock = recipes.filter(recipe => {
    let inStock = true;
    recipe.ingredients.forEach(ingredient => {
      const product = products.find(product => product._id.toString() === ingredient.product);
      if (product.stock.length < ingredient.quantity) inStock = false;
    });
    if (!inStock) return recipe;
  });

  new Metric({
    type: 'recipe_out_of_stock_count',
    value: outOfStock.length
  }).save(callback);
};
getInStockRecipeCount = callback => {
  const inStockRecipes = recipes.filter(recipe => {
    let inStock = true;
    recipe.ingredients.forEach(ingredient => {
      const product = products.find(product => product._id.toString() === ingredient.product);
      if (product.stock.length < ingredient.quantity) inStock = false;
    });
    if (inStock) return recipe;
  });

  new Metric({
    type: 'recipe_in_stock_count',
    value: inStockRecipes.length
  }).save(callback);
};

setTimeout(generateMetrics, 3000);
