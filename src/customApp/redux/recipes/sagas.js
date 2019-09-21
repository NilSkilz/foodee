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
    loading();
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'RECIPE_CREATE_FAILED' });
  }
}

function* updateRecipe({ recipe }) {
  const loading = message.loading('Saving recipe...', 0);
  try {
    const updated = yield putRecipe(recipe);
    message.success(`Recipe Saved!`);
    console.log('UPDATED:', updated);
    yield put({ type: 'RECIPE_UPDATE_SUCCEEDED', recipe: updated });
    loading();
  } catch (e) {
    loading();
    message.error(e.message);
    yield put({ type: 'RECIPE_UPDATE_FAILED' });
  }
}
export default function* rootSaga() {
  yield all([takeEvery(actions.RECIPE_CREATE, createRecipe)]);
  yield all([takeEvery(actions.RECIPE_UPDATE, updateRecipe)]);
}

const postRecipe = recipe => {
  console.log('posting:', recipe);
  return Axios.post('/api/recipes/', recipe).then(data => {
    return data.data;
  });
};

const putRecipe = recipe => {
  console.log('putting:', recipe);
  return Axios.put(`/api/recipes/${recipe._id}`, recipe).then(data => {
    console.log('Data:', data.data.data);
    return data.data.data;
  });
};
