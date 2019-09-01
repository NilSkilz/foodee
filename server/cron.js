var express = require('express');
var app = express();
var mongoose = require('mongoose');

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

setTimeout(generateStats, 5000);
