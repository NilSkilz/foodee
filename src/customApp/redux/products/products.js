import _ from 'lodash';
import Axios from 'axios';
import moment from 'moment';

const initState = [];

export default function products(state = initState, action) {
  switch (action.type) {
    // ----------------------
    // Products

    case 'ADD_PRODUCT': {
      debugger;
      getProductFromAPI(action.barcode).then(product => {
        debugger;
        console.log(state);
        const { all } = state;
        const updated = _.cloneDeep(all);
        updated.push(product);
        return { ...state, all: updated };
      });
    }

    case 'ADD_PRODUCTS': {
      return { ...state, all: action.products };
    }

    case 'EDIT_PRODUCT': {
      return { ...state, editing: action.product };
    }

    case 'SHOW_PRODUCT': {
      return { ...state, showing: action.product };
    }

    case 'UPDATE_PRODUCT': {
      const { product } = action;
      const products = _.cloneDeep(state.products);
      const oldProduct = products.find(p => p._id === product._id);
      if (oldProduct) {
        products.splice(products.indexOf(oldProduct), 1, product);
      } else {
        // New product
        products.push(product);
      }
      return { ...state, all: products };
    }

    case 'DELETE_PRODUCT': {
      return { ...state, deleting: action.product };
    }

    case 'DELETE_PRODUCT_CONFIRM': {
      const { product } = action;
      const products = _.cloneDeep(state.products);
      const oldProduct = products.find(p => p._id === product._id);
      if (oldProduct) {
        products.splice(products.indexOf(oldProduct), 1);
      }
      return { ...state, all: products };
    }

    default:
      return state;
  }
}

const handleError = err => {
  console.log(err);
};

const getProductFromAPI = barcode => {
  return Axios.get(`/api/products/${barcode}`)
    .then(({ data }) => {
      if (!data.data) {
        getProductFromLabsAPI(barcode);
      } else {
        addProductToStock(data.data);
      }
    })
    .catch(err => handleError(err));
};

const getProductFromLabsAPI = barcode => {
  debugger;
  return Axios.get(`https://dev.tescolabs.com/product/?gtin=${barcode}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': 'ae8dba96f0f34dbb90e3c8706b4b7b0b'
    }
  })
    .then(({ data }) => {
      const { products } = data;
      if (products && products.length > 0) {
        getAdditionalInfoFromLabsAPI(products[0]);
      } else {
        throw new Error('Not Found');
      }
    })
    .catch(err => this.handleError(err));
};

const getAdditionalInfoFromLabsAPI = product => {
  const { departmentOptions, superDepartmentOptions } = this.state;
  return Axios.get(`https://dev.tescolabs.com/grocery/products/?query=${product.description}&offset=0&limit=10`, {
    headers: {
      'Ocp-Apim-Subscription-Key': 'ae8dba96f0f34dbb90e3c8706b4b7b0b'
    }
  })
    .then(({ data }) => {
      const results = _.get(data, 'uk.ghs.products.results', []);
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
        // console.log(product);
        // products.dispatch({
        //   type: 'EDIT_PRODUCT',
        //   product: product
        // });
        throw new Error('Cannot find complete product details');
      }
      saveProduct(product);
    })
    .catch(err => handleError(err));
};

const saveProduct = product => {
  if (!product._id) {
    Axios.post(`/api/products/`, product, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(({ data }) => {
        addProductToStock(data.data);
      })
      .catch(err => handleError(err));
  } else {
    Axios.put(`/api/products/${product._id}`, product, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(({ data }) => {
        console.log('on success');
        // this.setState({ product: product, success: 'Product updated' });
        // setTimeout(() => {
        // this.setState({ success: false });
        // }, 3000);
      })
      .catch(err => handleError(err));
  }
};

const addProductToStock = product => {
  const payload = {
    product: product._id,
    quantity: product.qtyContents.numberOfUnits || 1,
    minimum_stock: product.qtyContents.numberOfUnits * 2 || 2
  };
  if (product.best_before) {
    payload.best_before_date = moment()
      .startOf('day')
      .add(product.best_before.value, product.best_before.unit);
  }
  Axios.post(`/api/stock/`, payload)
    .then(() => {
      const newProduct = { gtin: '' };
      // this.setState(
      //   {
      //     product: newProduct,
      //     success: `Added 1x ${product.name}`
      //   },
      //   () => {
      //     this.props.dispatch({
      //       type: 'EDIT_PRODUCT',
      //       product: newProduct
      //     });
      //     console.log('state:', this.state.product);
      //   }
      // );

      // setTimeout(() => {
      //   this.setState({ product: newProduct, success: false });
      // }, 3000);
    })
    .catch(err => handleError(err));
};
