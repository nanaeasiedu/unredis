import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import Root from './containers/Root';
import { configure } from './store';
import sagas from './sagas';

const store = configure();
const history = syncHistoryWithStore(hashHistory, store);
store.runSaga(sagas);


ReactDOM.render(
  <Root store={store} history={history} />
  , document.getElementById('unredis-app'));
