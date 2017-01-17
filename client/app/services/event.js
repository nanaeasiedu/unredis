export default class Event {
  constructor (...cbs) {
    if (typeof window.EventSource === 'undefined') return;

    this.eventSource = new EventSource('/events');
    this.eventSource.onmessage = this.messageHandler.bind(this);
    this.cbs = cbs;
  }

  messageHandler (event) {
    for (var cb of this.cbs) {
      cb(JSON.parse(event.data));
    }
  }
}
