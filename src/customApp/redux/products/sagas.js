import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import Axios from 'axios';
import { message } from 'antd';
import _ from 'lodash';
import moment from 'moment';

function* createProduct({ barcode }) {
  const loading = message.loading('Searhing for product...', 0);
  try {
    const product = yield getProductFromAPI(barcode);
    loading();
    message.success(`1 x ${product.name} added`);
    yield put({ type: 'PRODUCT_CREATE_SUCCEEDED', product: product });
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'PRODUCT_CREATE_FAILED', product: { gtin: barcode } });
  }
}
export default function* rootSaga() {
  yield all([takeEvery(actions.PRODUCT_CREATE, createProduct)]);
}

const getProductFromAPI = barcode => {
  console.log('Getting product from API');
  return Axios.get(`/api/products/${barcode}`).then(({ data }) => {
    console.log('Got:', data.data);
    if (!data.data) {
      return getProductFromLabsAPI(barcode);
    } else {
      return addProductToStock(data.data);
    }
  });
};

const getProductFromLabsAPI = barcode => {
  console.log('Getting from labs API');
  return Axios.get(`https://dev.tescolabs.com/product/?gtin=${barcode}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': 'ae8dba96f0f34dbb90e3c8706b4b7b0b'
    }
  }).then(({ data }) => {
    console.log('Got ', data);
    const { products } = data;
    if (products && products.length > 0) {
      return getAdditionalInfoFromLabsAPI(products[0]);
    } else {
      throw new Error('Product not found');
    }
  });
};

const getAdditionalInfoFromLabsAPI = product => {
  const { departmentOptions, superDepartmentOptions } = this.state;
  return Axios.get(`https://dev.tescolabs.com/grocery/products/?query=${product.description}&offset=0&limit=10`, {
    headers: {
      'Ocp-Apim-Subscription-Key': 'ae8dba96f0f34dbb90e3c8706b4b7b0b'
    }
  }).then(({ data }) => {
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
      throw new Error('Cannot find complete product details');
    }
    return saveProduct(product);
  });
};

const saveProduct = product => {
  if (!product._id) {
    return Axios.post(`/api/products/`, product, {
      headers: { 'Content-Type': 'application/json' }
    }).then(({ data }) => {
      return addProductToStock(data.data);
    });
  } else {
    return Axios.put(`/api/products/${product._id}`, product, {
      headers: { 'Content-Type': 'application/json' }
    }).then(({ data }) => {
      return data;
    });
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
  return Axios.post(`/api/stock/`, payload).then(({ data }) => {
    return data.data;
  });
};
