// @flow
import {
  put,
  takeEvery,
  call,
  all,
} from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { fetchSourcesData } from '../api/fetchSourcesApi';
import type { SourceType } from '../../types';

export function* getSourcesSaga(action: {
  type: 'GET_SOURCES_REQUEST',
  payload?: (SourceType) => void
}): Saga<void> {
  try {
    const response = yield call(fetchSourcesData);
    if (action.payload && typeof action.payload === 'function') {
      action.payload(response);
    }
    yield put({ type: 'GET_SOURCES_SUCCESS', payload: response });
  } catch (error) {
    yield put({ type: 'GET_SOURCES_FAIL' });
  }
}

export default function* watchSourceSaga(): any {
  yield all([
    takeEvery('GET_SOURCES_REQUEST', getSourcesSaga),
  ]);
}
