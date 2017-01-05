import axios from 'axios';

const request = (method, path, data = {}) => {
  return axios({ method, data, url: path });
}

export default request;
