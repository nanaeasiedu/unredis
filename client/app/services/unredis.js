class Unredis {
  constructor (service) {
    this.service = service;
  }

  getStats () {
    return this.service.makeRequest('get', 'stats');
  }

  getServerInfo () {
    return this.service.makeRequest('get', 'info');
  }
}

export default function (service) {
  return new Unredis(service);
}
