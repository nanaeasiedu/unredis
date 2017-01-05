import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';

export const configure = (initState) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer,
    initState,
    compose(applyMiddleware(routerMiddleware(hashHistory), sagaMiddleware))
  );

  return { ...store, runSaga: sagaMiddleware.run };
}
