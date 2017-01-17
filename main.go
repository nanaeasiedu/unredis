package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"text/template"
	"time"

	"github.com/apcera/termtables"
	"github.com/gorilla/mux"
	"github.com/gosuri/uilive"
)

var (
	redisHost     string
	redisPort     int
	redisPassword string
	redisDatabase int
	serverHost    string
	serverPort    int
	serverUnRedis *UnRedis
	server        *http.Server
)

const (
	version = "v0.0.1-rc"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(200)
	var indexTemplate = template.Must(template.New("index").ParseFiles("templates/layout.html", "templates/index.html"))

	indexTemplate.ExecuteTemplate(w, "base", map[string]interface{}{
		"Title":   "HomePage",
		"Address": server.Addr,
	})
}

func init() {
	flag.StringVar(&redisHost, "redis-host", "localhost", "The host redis server can be found on")
	flag.IntVar(&redisPort, "redis-port", 6379, "The port is redis server is running on")
	flag.StringVar(&redisPassword, "redis-password", "", "The password for authentication")
	flag.IntVar(&redisDatabase, "redis-db", 0, "The redis database to connect to")
	flag.StringVar(&serverHost, "srv-host", "localhost", "The address to run the server on")
	flag.IntVar(&serverPort, "srv-port", 3000, "The port to run the server on")

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage %s \n", os.Args[0])
		fmt.Println("Version - " + version)
		flag.PrintDefaults()
	}
}

func main() {
	flag.Parse()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	serverUnRedis = NewUnRedis(redisHost, redisPort, redisPassword, redisDatabase).(*UnRedis)

	log.Println("Connecting to redis server")
	err := serverUnRedis.Connect()

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to redis server")
	defer serverUnRedis.DisConnect()
	stats := serverUnRedis.CollectStats(c)

	writer := uilive.New()
	writer.Start()
	defer writer.Stop()

	go func() {
		for {
			getStatistics := <-stats
			table := termtables.CreateTable()
			table.AddHeaders("Time", "Ops/sec", "Hit Rate", "Keyspace Hits", "Keyspace Misses", "Used Memory (KB)", "Connected Clients", "Last Save Time")

			for i := 0; i < len(getStatistics); i++ {
				statInfo := getStatistics[i]
				createdAtTime := time.Unix(0, statInfo.CreatedAt*int64(time.Millisecond))
				lastSaveTime := time.Unix(0, statInfo.RDBLastSaveTime*int64(time.Second))
				table.AddRow(createdAtTime.Format("15:04:05"), statInfo.OpsPerSec, statInfo.HitRate, statInfo.KeyspaceHits, statInfo.KeySpaceMisses, fmt.Sprintf("%.2f", statInfo.UsedMemory), statInfo.ConnectedClients, lastSaveTime.Format("02/01/2006 - 15:04:05"))
			}

			fmt.Fprint(writer, table.Render())
		}
	}()

	router := mux.NewRouter()
	router.StrictSlash(true)
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	router.HandleFunc("/", homeHandler)
	router.Handle("/events", serverUnRedis.Broker)
	apiHandler(router)

	server = &http.Server{
		Handler: router,
		Addr:    fmt.Sprintf("%s:%d", serverHost, serverPort),
	}

	log.Fatal(server.ListenAndServe())
}
