var express = require("express");
var app = express();
var http = require("http").createServer(app);
var _ = require("lodash");
var mongoose = require("mongoose");
var Jimp = require("jimp");
var nocr = require("nocr");
var async = require("async");
var moment = require("moment");
var Axios = require("axios");

var bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

// Connect to database
const uri = "mongodb://127.0.0.1/grocy-dev";

mongoose.connect(uri, {});

var Product = require("./product/product.model");
var Stock = require("./stock/stock.model");
var Department = require("./department/department.model");
var SuperDepartment = require("./superdepartment/superdepartment.model");
var Recipe = require("./recipe/recipe.model");
var Log = require("./log/log.model");

handleError = error => {
  console.log(error);
};

// ----------------------
//  Products
// ------------

// Product Creation

app.get("/api/products/:barcode", (req, res) => {
  Product.findOne({ gtin: req.params.barcode })
    .populate({
      path: "stock",
      match: { consumed_date: { $exists: false } }
    })
    .exec()
    .then(product => {
      if (product) {
        res.send({
          total: 1,
          page: 1,
          data: product
        });
      } else {
        getProductFromLabsAPI(req.params.barcode)
          .then(product => {
            res.send({
              total: 1,
              page: 1,
              data: product
            });
          })
          .catch(err => res.send(err));
      }
    })
    .catch(err => handleError(err));
});

const getProductFromLabsAPI = barcode => {
  console.log("Getting from labs API");
  return Axios.get(`https://dev.tescolabs.com/product/?gtin=${barcode}`, {
    headers: {
      "Ocp-Apim-Subscription-Key": "ae8dba96f0f34dbb90e3c8706b4b7b0b"
    }
  }).then(({ data }) => {
    console.log("Got ", data);
    const { products } = data;
    if (products && products.length > 0) {
      return getAdditionalInfoFromLabsAPI(products[0]);
    } else {
      throw new Error("Product not found");
    }
  });
};

const getAdditionalInfoFromLabsAPI = product => {
  const { departmentOptions, superDepartmentOptions } = this.state;
  return Axios.get(
    `https://dev.tescolabs.com/grocery/products/?query=${product.description}&offset=0&limit=10`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": "ae8dba96f0f34dbb90e3c8706b4b7b0b"
      }
    }
  ).then(({ data }) => {
    const results = _.get(data, "uk.ghs.products.results", []);
    const item = results.find(item => item.tpnb === parseInt(product.tpnb));

    product.name = product.description;

    if (item) {
      product.image = item.image;
      product.department = item.department;
      product.superDepartment = item.superDepartment;
      product.price = item.price;
    } else {
      product.minimum_stock = 2;
      product.department = departmentOptions[0]._id;
      product.superDepartment = superDepartmentOptions[0]._id;
      throw new Error("Cannot find complete product details");
    }
    return saveProduct(product);
  });
};

const saveProduct = product => {
  if (!product._id) {
    return Axios.post(`/api/products/`, product, {
      headers: { "Content-Type": "application/json" }
    }).then(({ data }) => {
      return addProductToStock(data.data);
    });
  } else {
    return Axios.put(`/api/products/${product._id}`, product, {
      headers: { "Content-Type": "application/json" }
    }).then(({ data }) => {
      return data;
    });
  }
};

// -------

app.get("/api/products/", (req, res) => {
  Product.find(req.query.where)
    .populate({
      path: "stock",
      match: { consumed_date: { $exists: false } }
    })
    .exec()
    .then(products => {
      res.send({
        results: products
      });
    })
    .catch(err => handleError(err));
});

app.put("/api/products/:id", (req, res) => {
  Product.findByIdAndUpdate(req.params.id, req.body)
    .exec()
    .then(data => {
      res.send({
        data
      });
    })
    .catch(err => handleError(err));
});

app.delete("/api/products/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .exec()
    .then(res.status(204).send())
    .catch(err => handleError(err));
});

app.post("/api/products", (req, res) => {
  console.log("New Product: ", req.body);
  const { department, superDepartment } = req.body;

  getDepartment(department)
    .then(dept => {
      getSuperDepartment(superDepartment).then(superDept => {
        getBestBeforeDate(req.body.image).then(bestBefore => {
          new Product({
            ...req.body,
            department: dept._id,
            superDepartment: superDept._id,
            best_before: bestBefore ? bestBefore : undefined,
            _id: new mongoose.Types.ObjectId()
          })
            .save()
            .then(data => {
              const payload = {
                total: 1,
                page: 1,
                data
              };

              res.send(payload);
            });
        });
      });
    })
    .catch(err => handleError(err));
});

getDepartment = departmentName => {
  return new Promise((resolve, reject) => {
    Department.findOne({ name: departmentName })
      .exec()
      .then(dept => {
        if (!dept) {
          new Department({
            _id: new mongoose.Types.ObjectId(),
            name: departmentName
          })
            .save()
            .then(dept => resolve(dept));
        } else {
          resolve(dept);
        }
      })
      .catch(err => handleError(err));
  });
};

getSuperDepartment = superDepartmentName => {
  return new Promise((resolve, reject) => {
    SuperDepartment.findOne({ name: superDepartmentName })
      .exec()
      .then(dept => {
        if (!dept) {
          new SuperDepartment({
            _id: new mongoose.Types.ObjectId(),
            name: superDepartmentName
          })
            .save()
            .then(dept => resolve(dept));
        } else {
          resolve(dept);
        }
      })
      .catch(err => handleError(err));
  });
};

getBestBeforeDate = (image, id) => {
  return new Promise((resolve, reject) => {
    if (!image) resolve(null);
    Jimp.read(image.replace("http", "https").replace("90x90", "540x540"))
      .then(image => {
        const filename = id ? `images/${id}.png` : "images/best-before.png";
        image
          .crop(363, 0, 177, 177)
          .writeAsync(filename)
          .then(() => {
            nocr.decodeFile(filename, function(error, data) {
              if (error) return resolve(null);
              if (data) {
                const str = data.replace(/\s/g, "");

                if (str === "Bestsameday")
                  return resolve({ unit: "days", value: 1 });

                if (str.split("+").length === 2) {
                  const value = str.split("+")[0];
                  const unit = str.split("+")[1];
                  if (
                    parseInt(value) !== NaN &&
                    (unit === "days" || unit === "weeks")
                  ) {
                    return resolve({ unit, value });
                  } else {
                    console.log("not recognised", str);
                    resolve(null);
                  }
                } else {
                  console.log("cant split", str);
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

// ----------------------
//  Stocks
// ------------

app.put("/api/stock/:id", (req, res) => {
  Stock.findByIdAndUpdate(req.params.id, req.body)
    .exec()
    .then(stock => {
      res.send({
        data: stock
      });
      const difference = req.body.quantity - stock.quantity;
      if (difference > 0) {
        Product.findById(stock.product)
          .exec()
          .then(product => {
            new Log({
              _id: new mongoose.Types.ObjectId(),
              stockChange: difference,
              product: product
            }).save();
          });
      }
    })
    .catch(err => handleError(err));
});

app.post("/api/stock", (req, res) => {
  req.body._id = new mongoose.Types.ObjectId();
  new Stock(req.body)
    .save()
    .then(data =>
      Product.findById(req.body.product)
        .exec()
        .then(product => {
          product.stock.push(data);
          product.save().then(data => {
            payload = {
              total: 1,
              page: 1,
              data
            };
            res.send(payload);
            new Log({
              _id: new mongoose.Types.ObjectId(),
              stockChange: 1,
              product: product
            }).save();
          });
        })
    )
    .catch(err => handleError(err));
});

app.get("/api/logs", (req, res) => {
  Log.find({})
    .limit(10)
    .sort({ created_at: -1 })
    .exec()
    .then(logs => {
      res.send({
        data: logs
      });
    });
});

// ----------------------
//  Recipes
// ------------

app.get("/api/recipes", (req, res) => {
  Recipe.find()
    .exec()
    .then(recipes => {
      res.send({
        total: recipes.length,
        page: 1,
        results: recipes
      });
    })
    .catch(err => handleError(err));
});

app.post("/api/recipes", (req, res) => {
  new Recipe(req.body)
    .save()
    .then(recipe => {
      const payload = {
        total: 1,
        page: 1,
        data: recipe
      };
      res.send(payload);
    })
    .catch(err => handleError(err));
});

app.put("/api/recipes/:id", (req, res) => {
  Recipe.findByIdAndUpdate(req.params.id, req.body)
    .exec()
    .then(recipe => {
      res.send({
        total: 1,
        page: 1,
        data: recipe
      });
    })
    .catch(err => handleError(err));
});

app.delete("/api/recipes/:id", (req, res) => {
  Recipe.findByIdAndDelete(req.params.id)
    .exec()
    .then(res.status(204).send())
    .catch(err => handleError(err));
});

// ----------------------
//  Departments
// ------------

app.get("/api/departments", (req, res) => {
  Department.find()
    .exec()
    .then(departments => {
      res.send({
        total: departments.length,
        page: 1,
        data: departments
      });
    });
});

app.get("/api/superdepartments", (req, res) => {
  SuperDepartment.find()
    .exec()
    .then(departments => {
      res.send({
        total: departments.length,
        page: 1,
        data: departments
      });
    });
});

app.get("/api/auth", function(req, res) {
  res.json(user);
});

app.post("/api/auth/login", function(req, res) {
  user = _.cloneDeep(LOGGED_IN_USER);
  res.json(user);
});

app.post("/api/auth/logout", function(req, res) {
  user = false;
  res.json(user);
});

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

updateStocks = () => {
  Stock.find({ consumed_date: { $exists: false } })
    .populate("product")
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

// setTimeout(getBestBeforeDatesForExistingProducts, 15000);
// setTimeout(updateStocks, 15000);

http.listen(4000, function() {
  console.log("Example app listening on port 4000!");
});
