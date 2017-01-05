import { FETCH_SUCCESS, FETCH_FAILED } from '../actions';

const initialState = {
  data: null,
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FAILED:
      return { ...state, error: action.payload.error };
    case FETCH_SUCCESS:
      return { error: null, data: action.payload.data };
    default:
      return state;
  }
}
