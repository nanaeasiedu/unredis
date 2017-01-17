import { FETCH_SUCCESS, FETCH_FAILED, FETCH_STATS_SUCCESS } from '../actions';

const initialState = {
  data: null,
  error: null,
  recent: null
};

function updateUnredisData(data, state) {
  if (data.error) return { ...state, error: data.error };

  var getData = { ...state.data };
  getData[data.type] = data.content;
  return { ...state, error: null, data: getData };
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FAILED:
      return { ...state, error: action.payload.error };
    case FETCH_SUCCESS:
      return updateUnredisData(action.payload.data, state);
    case FETCH_STATS_SUCCESS:
      return { ...state, recent: action.payload.data };
    default:
      return state;
  }
}
