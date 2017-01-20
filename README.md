## UNREDIS - Another Redis Monitoring Tool

Another redis monitoring tool built with Golang

## Installation

Using `go get`

```bash
$ go get -u github.com/ngenerio/unredis
```

## Manual Installation

- Clone the repo into your $GOPATH
- Build with

```bash
$ make release
```

## Usage

```
Usage ./unredis -redis-host HOST -redis-port PORT
  -redis-db int
    	The redis database to connect to
  -redis-host string
    	The host redis server can be found on (default "localhost")
  -redis-password string
    	The password for authentication
  -redis-port int
    	The port is redis server is running on (default 6379)
  -srv-host string
    	The address to run the server on (default "localhost")
  -srv-port int
    	The port to run the server on (default 3000)
```

Basic usage, run:

```bash
$ unredis
```

Specify the redis port and host, run:

```bash
$ unredis -redis-port PORT -redis-host=HOST
```

For more information:

```bash
$ unredis --help
```

After a successful start, go to [localhost:3000](http://localhost:3000) in your browser if you did not specify a different port to run the server on

## NB
This is not yet done. The dashboard is very basic right now.

The stats data shown on the dashboard is ephemeral. Only the last 10 stats is stored and saved to disk when the program exists.

## TODO

- [x] Add OPS/SEC widget to the dashboard
- [] Display table containing redis server information
- [] Add latency to stats
- [x] Display the stats in the terminal
- [x] Use event source to send new stats data to the client

## Technologies

- [Golang](https://golang.org/)
- [React.js](https://facebook.github.io/react/)
- [Redux](https://github.com/reactjs/redux)
- [Redux-Saga](https://redux-saga.github.io/redux-saga/)
