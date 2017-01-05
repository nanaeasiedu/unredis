import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import init from './init';

export default combineReducers({
  routing,
  init
});
