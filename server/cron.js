var express = require('express');
var app = express();
var mongoose = require('mongoose');
var async = require('async');
var moment = require('moment');
var Jimp = require('jimp');
var nocr = require('nocr');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

// Connect to database
const uri = 'mongodb://127.0.0.1/grocy-dev';

mongoose.connect(uri, {});

var Product = require('./product/product.model');
var Stock = require('./stock/stock.model');

handleError = error => {
  console.log(error);
};

generateStats = () => {
  Promise.all([getTotalValue(), getTotalInStock()]).then((totalValue, stock) => {
    console.log(totalValue, stock);
  });
};

getTotalValue = () => {
  return new Promise((resolve, reject) => {
    Stock.find({ consumed_date: { $exists: false } })
      .populate('product')
      .exec()
      .then(stocks => {
        let totalValue = 0;

        stocks.forEach(stock => {
          console.log(stock._id);
          if (stock.product.price) {
            totalValue += stock.product.price;
          }
        });
        resolve(totalValue);
      });
  });
};

getProductStockCount = product => {
  return product.stock.length === 0
    ? 0
    : product.stock.reduce((acc, stock) => {
        return { quantity: acc.quantity + stock.quantity };
      });
};

getTotalInStock = () => {
  return new Promise((resolve, reject) => {
    Product.find()
      .populate({
        path: 'stock',
        match: { consumed_date: { $exists: false } }
      })
      .exec()
      .then(products => {
        inStock = 0;
        lowStock = 0;
        outOfStock = 0;
        products.forEach(product => {
          if (product.stock.length > 0) {
            inStock++;
            if (getProductStockCount(product).quantity < product.minimum_stock) {
              lowStock++;
            }
          } else {
            outOfStock++;
          }
        });
        resolve({ in_stock: inStock, low_stock: lowStock, out_of_stock: outOfStock });
      });
  });
};

getBestBeforeDatesForExistingProducts = () => {
  Product.find({})
    .exec()
    .then(products => {
      async.eachSeries(products, (product, cb) => {
        if (product.image) {
          getBestBeforeDate(product.image, product._id).then(bestBefore => {
            if (bestBefore && bestBefore.unit && bestBefore.value) {
              product.best_before = bestBefore;
              product.save(cb);
            } else {
              cb();
            }
          });
        } else {
          cb();
        }
      });
      products.forEach(product => {});
    });
};

getBestBeforeDate = (image, id) => {
  return new Promise((resolve, reject) => {
    if (!image) resolve(null);
    Jimp.read(image.replace('http', 'https').replace('90x90', '540x540'))
      .then(image => {
        const filename = id ? `images/${id}.png` : 'images/best-before.png';
        image
          .crop(363, 0, 177, 177)
          .writeAsync(filename)
          .then(() => {
            nocr.decodeFile(filename, function(error, data) {
              if (error) return resolve(null);
              if (data) {
                const str = data.replace(/\s/g, '');

                if (str === 'Bestsameday') return resolve({ unit: 'days', value: 1 });

                if (str.split('+').length === 2) {
                  const value = str.split('+')[0];
                  const unit = str.split('+')[1];
                  if (parseInt(value) !== NaN && (unit === 'days' || unit === 'weeks')) {
                    return resolve({ unit, value });
                  } else {
                    console.log('not recognised', str);
                    resolve(null);
                  }
                } else {
                  console.log('cant split', str);
                  resolve(null);
                }
              } else {
                return resolve(null);
              }
            });
          });
        // Do stuff with the image.
      })
      .catch(err => {
        console.log(err);
        return resolve(null);
        // Handle an exception.
      });
  });
};

updateStocks = () => {
  Stock.find({ consumed_date: { $exists: false } })
    .populate('product')
    .exec()
    .then(stocks => {
      async.eachSeries(stocks, (stock, cb) => {
        if (stock.product && stock.product.best_before) {
          const bestBeforeDate = moment(stock.purchase_date).add(
            stock.product.best_before.value,
            stock.product.best_before.unit
          );
          stock.best_before_date = bestBeforeDate;
          stock.save(cb);
        } else {
          cb();
        }
      });
    });
};

setTimeout(generateStats, 5000);
setTimeout(updateStocks, 15000);
setTimeout(getBestBeforeDatesForExistingProducts, 35000);
