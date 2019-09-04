import { all } from 'redux-saga/effects';
import githubSearchSagas from './githubSearch/sagas';
import productSagas from './products/sagas';

export default function* devSaga() {
  yield all([githubSearchSagas(), productSagas()]);
}
