// @flow
import {
  put,
  takeEvery,
  call,
  all,
} from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { Toast } from '@sfxdx/ui-kit';
import {
  fetchDeleteContact,
  fetchCreateContact,
  fetchUpdateContact,
  fetchGetContact,
} from '../api/fetchContactApi';
import type { ContactType } from '../../types';

export function* updateContactSaga(action: {
  type: 'UPDATE_CONTACT_REQUEST',
  payload: {
    id: string,
    value: string
  }
}): Saga<void> {
  try {
    const response = yield call(fetchUpdateContact, action.payload);
    yield put({ type: 'UPDATE_CONTACT_SUCCESS', payload: response });
  } catch (error) {
    Toast.push({ message: String(error), type: 'danger' });
    yield put({ type: 'UPDATE_CONTACT_FAIL' });
  }
}

export function* getContactSaga(action: {
  type: 'GET_CONTACT_REQUEST',
  payload: {
    dealId: string,
  }
}): Saga<void> {
  try {
    const response = yield call(fetchGetContact, action.payload);
    yield put({ type: 'SET_CONTACTS', payload: response });
  } catch (error) {
    Toast.push({ message: String(error), type: 'danger' });
    yield put({ type: 'GET_CONTACT_FAIL' });
  }
}

export function* deleteContactSaga(action: {
  type: 'DELETE_CONTACT_REQUEST',
  payload: {
    id: string,
    returnContacts?: (Array<ContactType>) => void,
  }
}): Saga<void> {
  try {
    const response = yield call(fetchDeleteContact, { id: action.payload.id });
    if (action.payload.returnContacts && typeof action.payload.returnContacts === 'function') {
      action.payload.returnContacts(response);
    }
    yield put({ type: 'DELETE_CONTACT_SUCCESS', payload: response });
    // yield put({
    //   type: 'GET_CONTACT_REQUEST',
    //   payload: { dealId: action.payload.id },
    // });
  } catch (error) {
    Toast.push({ message: String(error), type: 'danger' });
    yield put({ type: 'DELETE_CONTACT_FAIL' });
  }
}

export function* createContactSaga(action: {
  type: 'CREATE_CONTACT_REQUEST',
  payload: {
    dealId: string,
    parameterId: string,
    value: string,
  },
  contacts: Array<ContactType>
}): Saga<void> {
  try {
    yield call(fetchCreateContact, action.payload);
    yield put({
      type: 'GET_CONTACT_REQUEST',
      payload: action.payload,
    });
  } catch (error) {
    Toast.push({ message: String(error), type: 'danger' });
    yield put({ type: 'CREATE_CONTACT_FAIL' });
  }
}

export default function* watchContactSaga(): any {
  yield all([
    takeEvery('DELETE_CONTACT_REQUEST', deleteContactSaga),
    takeEvery('CREATE_CONTACT_REQUEST', createContactSaga),
    takeEvery('UPDATE_CONTACT_REQUEST', updateContactSaga),
    takeEvery('GET_CONTACT_REQUEST', getContactSaga),
  ]);
}
