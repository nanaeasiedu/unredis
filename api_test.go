package main

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

var tests = []struct {
	Method string
	Path   string
	Body   io.Reader
	Status int
}{
	{
		Method: "GET",
		Path:   "/status",
		Status: http.StatusOK,
	},
	{
		Method: "GET",
		Path:   "/info",
		Status: http.StatusOK,
	},
	{
		Method: "GET",
		Path:   "/keys",
		Status: http.StatusOK,
	},
	{
		Method: "GET",
		Path:   "/keys/*",
		Status: http.StatusOK,
	},
	{
		Method: "GET",
		Path:   "/keys_tree",
		Status: http.StatusOK,
	},
	{
		Method: "POST",
		Path:   "/exec",
		Body:   strings.NewReader(`{"cmd": "keys *"}`),
		Status: http.StatusOK,
	},
	{
		Method: "GET",
		Path:   "/stats",
		Status: http.StatusOK,
	},
}

func TestAPI(t *testing.T) {
	for _, test := range tests {
		req, err := http.NewRequest(test.Method, testServer.URL+"/api"+test.Path, test.Body)
		itsNil(t, err)
		res, err := client.Do(req)
		itsNil(t, err)
		equal(t, test.Status, res.StatusCode)
	}
}
