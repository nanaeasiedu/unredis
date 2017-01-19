export default class Event {
  constructor (...cbs) {
    if (typeof window.EventSource === 'undefined') return;

    this.messageHandler = this.messageHandler.bind(this);
    this.cbs = cbs;
  }

  start () {
    this.eventSource = new EventSource('/events');
    this.eventSource.onmessage = this.messageHandler;
  }

  stop () {
    this.eventSource.close();
  }

  messageHandler (event) {
    for (var cb of this.cbs) {
      cb(JSON.parse(event.data));
    }
  }
}
