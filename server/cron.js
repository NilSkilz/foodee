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
  callback();
  // new Metric({
  //   type: 'product_count',
  //   value: products.length
  // }).save(callback);
};

getOutOfStockCount = callback => {
  const outOfStock = products.filter(product => {
    let inStock = true;
    product.stock.forEach(stock => {
      if (stock.consumed_date) {
        inStock = false;
      }
    });
    if (!inStock) {
      return product;
    }
  });
  console.log(outOfStock.length);
  new Metric({
    type: 'product_out_of_stock_count',
    value: outOfStock.length
  }).save(callback);
};

getInStockCount = callback => {
  const productsInStock = products.filter(product => {
    let inStock = true;
    product.stock.forEach(stock => {
      if (stock.consumed_date) {
        inStock = false;
      }
    });
    if (inStock) {
      return product;
    }
  });
  console.log(productsInStock.length);
  new Metric({
    type: 'product_in_stock_count',
    value: productsInStock.length
  }).save(callback);
};

getRecipeCount = callback => {};
getOutOfStockRecipeCount = callback => {};
getInStockRecipeCount = callback => {};

setTimeout(generateMetrics, 3000);

// handleError = error => {
//   console.log(error);
// };

// generateStats = () => {
//   Promise.all([getTotalValue(), getTotalInStock()]).then((totalValue, stock) => {
//     console.log(totalValue, stock);
//   });
// };

// getTotalValue = () => {
//   return new Promise((resolve, reject) => {
//     Stock.find({ consumed_date: { $exists: false } })
//       .populate('product')
//       .exec()
//       .then(stocks => {
//         let totalValue = 0;

//         stocks.forEach(stock => {
//           console.log(stock._id);
//           if (stock.product.price) {
//             totalValue += stock.product.price;
//           }
//         });
//         resolve(totalValue);
//       });
//   });
// };

// getProductStockCount = product => {
//   return product.stock.length === 0
//     ? 0
//     : product.stock.reduce((acc, stock) => {
//         return { quantity: acc.quantity + stock.quantity };
//       });
// };

// getTotalInStock = () => {
//   return new Promise((resolve, reject) => {
//     Product.find()
//       .populate({
//         path: 'stock',
//         match: { consumed_date: { $exists: false } }
//       })
//       .exec()
//       .then(products => {
//         inStock = 0;
//         lowStock = 0;
//         outOfStock = 0;
//         products.forEach(product => {
//           if (product.stock.length > 0) {
//             inStock++;
//             if (getProductStockCount(product).quantity < product.minimum_stock) {
//               lowStock++;
//             }
//           } else {
//             outOfStock++;
//           }
//         });
//         resolve({ in_stock: inStock, low_stock: lowStock, out_of_stock: outOfStock });
//       });
//   });
// };

// getBestBeforeDatesForExistingProducts = () => {
//   Product.find({})
//     .exec()
//     .then(products => {
//       async.eachSeries(products, (product, cb) => {
//         if (product.image) {
//           getBestBeforeDate(product.image, product._id).then(bestBefore => {
//             if (bestBefore && bestBefore.unit && bestBefore.value) {
//               product.best_before = bestBefore;
//               product.save(cb);
//             } else {
//               cb();
//             }
//           });
//         } else {
//           cb();
//         }
//       });
//       products.forEach(product => {});
//     });
// };

// getBestBeforeDate = (image, id) => {
//   return new Promise((resolve, reject) => {
//     if (!image) resolve(null);
//     Jimp.read(image.replace('http', 'https').replace('90x90', '540x540'))
//       .then(image => {
//         const filename = id ? `images/${id}.png` : 'images/best-before.png';
//         image
//           .crop(363, 0, 177, 177)
//           .writeAsync(filename)
//           .then(() => {
//             nocr.decodeFile(filename, function(error, data) {
//               if (error) return resolve(null);
//               if (data) {
//                 const str = data.replace(/\s/g, '');

//                 if (str === 'Bestsameday') return resolve({ unit: 'days', value: 1 });

//                 if (str.split('+').length === 2) {
//                   const value = str.split('+')[0];
//                   const unit = str.split('+')[1];
//                   if (parseInt(value) !== NaN && (unit === 'days' || unit === 'weeks')) {
//                     return resolve({ unit, value });
//                   } else {
//                     console.log('not recognised', str);
//                     resolve(null);
//                   }
//                 } else {
//                   console.log('cant split', str);
//                   resolve(null);
//                 }
//               } else {
//                 return resolve(null);
//               }
//             });
//           });
//         // Do stuff with the image.
//       })
//       .catch(err => {
//         console.log(err);
//         return resolve(null);
//         // Handle an exception.
//       });
//   });
// };

// updateStocks = () => {
//   Stock.find({ consumed_date: { $exists: false } })
//     .populate('product')
//     .exec()
//     .then(stocks => {
//       async.eachSeries(stocks, (stock, cb) => {
//         if (stock.product && stock.product.best_before) {
//           const bestBeforeDate = moment(stock.purchase_date).add(
//             stock.product.best_before.value,
//             stock.product.best_before.unit
//           );
//           stock.best_before_date = bestBeforeDate;
//           stock.save(cb);
//         } else {
//           cb();
//         }
//       });
//     });
// };

// setTimeout(generateStats, 5000);
// setTimeout(updateStocks, 15000);
// setTimeout(getBestBeforeDatesForExistingProducts, 35000);
