import { take, apply, put, fork } from 'redux-saga/effects';
import services from '../services';
import { GET_STATS, FETCH_FAILED, FETCH_SUCCESS, startLoader, stopLoader, action } from '../actions';

function* getStats() {
  while (true) {
    yield take(GET_STATS);
    yield put(startLoader());

    var statsData = yield apply(services.UnRedisAPI, services.UnRedisAPI.getStats);
    var infoData = yield apply(services.UnRedisAPI, services.UnRedisAPI.getServerInfo);

    yield put(stopLoader());

    if (statsData.type !== 'success' || infoData.type !== 'success') {
      yield put(action(FETCH_FAILED, { error: 'Could not fetch either dashboard data or redis server info data' }));
    }

    yield put(action(FETCH_SUCCESS, { data: { statsData: statsData.data, infoData: infoData.data } }));
  }
}

export default function* root() {
  yield [
    fork(getStats)
  ];
}
