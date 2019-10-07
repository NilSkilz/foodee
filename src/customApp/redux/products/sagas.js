import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import Axios from 'axios';
import { message } from 'antd';
import _ from 'lodash';
import moment from 'moment';

function* createProduct({ barcode }) {
  const loading = message.loading('Searhing for product...', 0);
  try {
    const product = yield getProduct(barcode);
    loading();
    message.success(`1 x ${product.name} added`);
    yield put({ type: 'PRODUCT_CREATE_SUCCEEDED', product: product });
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'PRODUCT_CREATE_FAILED', product: { gtin: barcode } });
  }
}

function* updateProduct({ product }) {
  const loading = message.loading('Saving product...', 0);
  try {
    const updated = yield putProduct(product);
    loading();
    message.success(`Product Updated`);
    yield put({ type: 'PRODUCT_UPDATE_SUCCEEDED', product: updated });
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'PRODUCT_UPDATE_FAILED' });
  }
}
export default function* rootSaga() {
  yield all([takeEvery(actions.PRODUCT_CREATE, createProduct)]);
  yield all([takeEvery(actions.PRODUCT_UPDATE, updateProduct)]);
}

const putProduct = product => {
  console.log('Updating the product');
  return Axios.put(`/api/products/${product._id}`, product).then(({ data }) => {
    console.log('Got:', data.data);
    if (!data.data) {
      throw new Error('Something went wrong updating the product');
    } else {
      return data.data;
    }
  });
};

const getProduct = barcode => {
  console.log('Getting product from API');
  return Axios.get(`/api/products/${barcode}`).then(({ data }) => {
    console.log('Got:', data.data);
    if (!data.data) {
      throw new Error('Could not create the product');
    } else {
      return addProductToStock(data.data);
    }
  });
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
