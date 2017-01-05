package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type handler struct {
	handler func(*handler, http.ResponseWriter, *http.Request) error
}

// ServeHTTP handles the request
// All http handlers must implement this method
func (h handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	defer func() {
		if err := recover(); err != nil {
			var ok bool

			if err, ok = err.(error); ok {
				log.Println(err)
				h.HandleError(w, errors.New("Error occured while executing request"))
			}
		}
	}()

	if !serverUnRedis.Connected {
		h.Respond(w, http.StatusBadGateway, newErrorResponse("Redis server not connected. Try restarting unredis with redis-server running"))
		return
	}

	if err := h.handler(&h, w, r); err != nil {
		h.HandleError(w, err)
	}
}

func (handler handler) HandleError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	err = json.NewEncoder(w).Encode(newErrorResponse(err.Error()))

	if err != nil {
		log.Printf("Error occured %s \n", err.Error())
	}
}

func (handler handler) Respond(w http.ResponseWriter, status int, data interface{}) error {
	w.WriteHeader(status)
	err := json.NewEncoder(w).Encode(newSuccessResponse(data))

	return err
}

func isConnected(handler *handler, w http.ResponseWriter, r *http.Request) error {
	return handler.Respond(w, http.StatusOK, map[string]interface{}{
		"connected": serverUnRedis.Connected,
	})
}

func getKeysTree(handler *handler, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	var keysTree map[string]interface{}
	var err error

	if value, ok := vars["prefix"]; ok {
		keysTree, err = serverUnRedis.GetKeysTree(value)
	} else {
		keysTree, err = serverUnRedis.GetKeysTree("")
	}

	if err != nil {
		return err
	}

	return handler.Respond(w, http.StatusOK, keysTree)
}

func getRedisServerInfo(handler *handler, w http.ResponseWriter, r *http.Request) error {
	info, err := serverUnRedis.GetServerInfo()

	if err != nil {
		return err
	}

	return handler.Respond(w, http.StatusOK, info)
}

func getKeys(handler *handler, w http.ResponseWriter, r *http.Request) error {
	var keys []string
	var err error
	vars := mux.Vars(r)

	if value, ok := vars["prefix"]; ok {
		keys, err = serverUnRedis.GetKeys(value)
	} else {
		keys, err = serverUnRedis.GetKeys("")
	}

	if err != nil {
		return err
	}

	return handler.Respond(w, http.StatusOK, keys)
}

func getStats(handler *handler, w http.ResponseWriter, r *http.Request) error {
	return handler.Respond(w, http.StatusOK, serverUnRedis.stats)
}

func exec(handler *handler, w http.ResponseWriter, r *http.Request) error {
	var redisExec struct {
		Cmd string `json:"cmd"`
	}
	err := json.NewDecoder(r.Body).Decode(&redisExec)

	if err != nil {
		return err
	}

	reply, err := serverUnRedis.Exec(redisExec.Cmd)

	if err != nil {
		return err
	}

	return handler.Respond(w, http.StatusOK, reply)
}

func apiHandler(router *mux.Router) {
	s := router.PathPrefix("/api").Subrouter()
	s.Handle("/status", handler{isConnected})
	s.Handle("/info", handler{getRedisServerInfo})
	s.Handle("/keys", handler{getKeys})
	s.Handle("/keys/{prefix}", handler{getKeys})
	s.Handle("/keys_tree", handler{getKeysTree})
	s.Handle("/keys_tree/{prefix}", handler{getKeysTree})
	s.Handle("/stats", handler{getStats})
	s.Handle("/exec", handler{exec}).Methods("POST")
}
