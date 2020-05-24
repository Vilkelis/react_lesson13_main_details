import { takeLatest, put, spawn, retry } from 'redux-saga/effects';  
import { FETCH_SERVICES_REQUEST, FETCH_SERVICE_REQUEST } from '../actions/actionTypes';
import { fetchServicesSuccess, 
         fetchServicesFailure,
         fetchServiceSuccess, 
         fetchServiceFailure         
         } from '../actions/actionCreators'; 

const fetchService = async (id) => {    
  const response = await fetch(`${process.env.REACT_APP_API_URL}/${id}`);
  if(!response.ok) { 
    throw new Error(response.statusText);
  }
  return await response.json();
}

const fetchServices = async (id) => {    
  const response = await fetch(`${process.env.REACT_APP_API_URL}`);
  if(!response.ok) { 
    throw new Error(response.statusText);
  }
  return await response.json();
}

// watcher
function* watchFetchServicesSaga() {
  yield takeLatest(FETCH_SERVICES_REQUEST, handleFetchServicesSaga);
}

// worker
function *handleFetchServicesSaga(action) {
  try {
    const retryCount = 2;
    const retryDelay = 1 * 1000; // ms
    const data = yield retry(retryCount, retryDelay, fetchServices);
      yield put(fetchServicesSuccess(data));
  } catch (e) {
    yield put(fetchServicesFailure(e));
  }
}

// watcher
function* watchFetchServiceSaga() {
  yield takeLatest(FETCH_SERVICE_REQUEST, handleFetchServiceSaga);
}

// worker
function *handleFetchServiceSaga(action) {
  try {
    const retryCount = 2;
    const retryDelay = 1 * 1000; // ms
    const data = yield retry(retryCount, retryDelay, fetchService, action.payload);
    yield put(fetchServiceSuccess(data));
  } catch (e) {
    yield put(fetchServiceFailure(action.payload, e));
  }
}

export default function* saga() {
    yield spawn(watchFetchServicesSaga);
    yield spawn(watchFetchServiceSaga);
}