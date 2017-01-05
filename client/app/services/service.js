import request from './http';

var baseUrl = unredisConfig.serverAddress;

if (!~baseUrl.indexOf('http://')) {
  baseUrl =  `http://${baseUrl}`
}

var UnRedisService = {
  baseUrl
};

UnRedisService.makeRequest = (method, path, data = {}) => {
  return request(method, `${UnRedisService.baseUrl}/api/${path}`, data)
  .then((response) => {
    const { data } = response.data;
    return { type: 'success', data: data };
  })
  .catch((error) => {
    const { response } = error;
    return { type: 'errorr', data: response.data };
  })
};


export default UnRedisService;
