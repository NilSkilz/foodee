import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import Axios from 'axios';
import { message } from 'antd';
import _ from 'lodash';

function* updateStock({ stock }) {
  const loading = message.loading('Saving stock...', 0);
  try {
    const updated = yield putStock(stock);
    loading();
    message.success(`Stock Updated`);
    yield put({ type: 'STOCK_UPDATE_SUCCEEDED', stock: updated });
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'STOCK_UPDATE_FAILED' });
  }
}
export default function* rootSaga() {
  yield all([takeEvery(actions.STOCK_UPDATE, updateStock)]);
}

const putStock = stock => {
  console.log('Updating the stock');
  return Axios.put(`/api/stocks/${stock._id}`, stock).then(({ data }) => {
    console.log('Got:', data.data);
    if (!data.data) {
      throw new Error('Something went wrong updating the stock');
    } else {
      return data.data;
    }
  });
};
