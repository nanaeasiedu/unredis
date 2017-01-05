export const GET_STATS = 'GET_STATS';
export const START_LOAD = 'START_LOAD';
export const STOP_LOAD = 'STOP_LOAD';
export const FETCH_FAILED = 'FETCH_FAILED';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';

export const action = (type, payload = {}) => {
  return { type, payload };
};

export const getStats = () => (action(GET_STATS));

export const startLoader = () => (action(START_LOAD));

export const stopLoader = () => (action(STOP_LOAD));
