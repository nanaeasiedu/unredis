export default class Event {
  constructor (...cbs) {
    if (typeof window.EventSource === 'undefined') {
      this.hasSupportForEventSource = false;
      return;
    }

    this.hasSupportForEventSource = true;
    this.messageHandler = this.messageHandler.bind(this);
    this.cbs = cbs;
  }

  start () {
    if (!this.hasSupportForEventSource) return;

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
