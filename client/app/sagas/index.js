import { take, apply, put, fork } from 'redux-saga/effects';
import services from '../services';
import {
  GET_STATS, FETCH_FAILED, FETCH_STATS_SUCCESS, FETCH_SUCCESS, GET_INFO,
  action
} from '../actions';

function* getInfo() {
  while (true) {
    yield take(GET_INFO);

    var infoData = yield apply(services.UnRedisAPI, services.UnRedisAPI.getServerInfo);

    if (infoData.type !== 'success') {
      yield put(action(FETCH_FAILED, { error: 'Could not fetch either redis info data' }));
    }

    yield put(action(FETCH_SUCCESS, { data: { content: infoData.data, type: 'info' } }));
  }
}

function* getStats() {
  while (true) {
    yield take(GET_STATS);

    var statsData = yield apply(services.UnRedisAPI, services.UnRedisAPI.getStats);

    if (statsData.type !== 'success') {
      yield put(action(FETCH_FAILED, { error: 'Could not fetch either dashboard data' }));
    }

    yield put(action(FETCH_SUCCESS, { data: { content: statsData.data, type: 'stats' } }));
  }
}

export default function* root() {
  yield [
    fork(getStats),
    fork(getInfo)
  ];
}
