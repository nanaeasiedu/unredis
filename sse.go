package main

import (
	"fmt"
	"net/http"
)

type Broker struct {
	Notifier       chan []byte
	clients        map[chan []byte]bool
	closingClients chan chan []byte
	newClient      chan chan []byte
}

func NewBrokerServer() (broker *Broker) {
	broker = &Broker{
		// Make notifier a buffered(asynchronous) channel
		Notifier:       make(chan []byte, 1),
		clients:        make(map[chan []byte]bool),
		closingClients: make(chan chan []byte),
		newClient:      make(chan chan []byte),
	}

	go broker.Listen()

	return
}

func (b *Broker) Listen() {
	for {
		select {

		case newClient := <-b.newClient:
			b.clients[newClient] = true

		case closedClient := <-b.closingClients:
			delete(b.clients, closedClient)

		case event := <-b.Notifier:
			for client, _ := range b.clients {
				client <- event
			}

		}
	}
}

func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)

	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	messageChannel := make(chan []byte)
	b.newClient <- messageChannel

	defer func() {
		b.closingClients <- messageChannel
	}()

	notify := w.(http.CloseNotifier).CloseNotify()

	for {
		select {
		case <-notify:
			return
		default:
			fmt.Fprintf(w, "data: %s\n\n", <-messageChannel)
			flusher.Flush()
		}
	}

}
