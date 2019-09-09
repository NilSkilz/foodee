import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import Axios from 'axios';
import { message } from 'antd';

function* createRecipe({ recipe }) {
  const loading = message.loading('Saving recipe...', 0);
  try {
    const created = yield postRecipe(recipe);
    message.success(`Recipe Saved!`);
    yield put({ type: 'RECIPE_CREATE_SUCCEEDED', recipe: created });
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'RECIPE_CREATE_FAILED' });
  }
}
export default function* rootSaga() {
  yield all([takeEvery(actions.RECIPE_CREATE, createRecipe)]);
}

const postRecipe = recipe => {
  console.log('posting:', recipe);
  Axios.post('/api/recipes/', recipe).then(data => {
    return data.data;
  });
};
