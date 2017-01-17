package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"log"

	"encoding/json"

	"github.com/garyburd/redigo/redis"
)

const (
	foldingCharacter = ":"
)

var (
	newLineEnding    = regexp.MustCompile(`\r?\n`)
	doubleLineEnding = regexp.MustCompile(`(\r?\n){2}`)
)

type keysMap struct {
	Count    int      `json:"count"`
	Children []string `json:"children"`
	Leaf     bool     `json:"leaf"`
}

// IUnRedis describes what unredis does
type IUnRedis interface {
	Connect() error
	DisConnect()
	GetKeysTree(prefix string) (map[string]interface{}, error)
	GetKeys(prefix string) ([]string, error)
	GetServerInfo() (map[string]map[string]interface{}, error)
	Exec(command string) (interface{}, error)
	CollectStats(c chan os.Signal) (stats chan []*stat)
}

type UnRedis struct {
	Connection redis.Conn
	Connected  bool
	config     *redisConfig
	stats      []*stat
	Broker     *Broker
	sync.Mutex
}

// redisConfig defines the structure of the config accepted by UnRedis
type redisConfig struct {
	redisHost     string
	redisPort     int
	redisPassword string
	redisDatabase int
}

// NewUnRedis creates a new unredis instance based on the options passed to it
func NewUnRedis(redisHost string, redisPort int, redisPassword string, redisDatabase int) IUnRedis {
	config := &redisConfig{
		redisHost, redisPort, redisPassword, redisDatabase,
	}

	unredis := &UnRedis{
		config: config,
		Broker: NewBrokerServer(),
	}

	go unredis.Broker.Listen()

	return unredis
}

// Connect connects to the reids
func (u *UnRedis) Connect() error {
	var dbOptions []redis.DialOption
	if u.config.redisPassword != "" {
		dbOptions = append(dbOptions, redis.DialPassword(u.config.redisPassword))
	}
	dbOptions = append(dbOptions, redis.DialDatabase(u.config.redisDatabase))

	conn, err := redis.Dial("tcp", fmt.Sprintf("%s:%d", u.config.redisHost, u.config.redisPort), dbOptions...)

	if err != nil {
		return err
	}

	u.Connected = true
	u.Connection = conn

	return nil
}

// Disconnect discounnects from the redis server
func (u *UnRedis) DisConnect() {
	if !u.Connected {
		u.Connection.Close()
		u.Connected = false
	}
}

func (u *UnRedis) getPrefixString(prefix string) (search string) {
	if prefix != "" {
		search = prefix + foldingCharacter + "*"
	} else {
		search = "*"
	}

	return
}

// processReply processes the reply gotten from redis
func (u *UnRedis) processReply(reply interface{}) interface{} {
	switch reply.(type) {
	case int64:
		return reply.(int64)

	case string:
		return reply.(string)

	default:
		if replyBytes, ok := reply.([]byte); ok {
			return string(replyBytes[:])
		} else if replyVal, ok := reply.([]interface{}); ok {
			keysArray := make([]string, len(replyVal))
			for i, val := range replyVal {
				valStr := string((val.([]byte))[:])
				keysArray[i] = valStr
			}

			return keysArray
		} else {
			return reply.([]interface{})
		}
	}
}

// GetKeysTree returns a tree of all the keys in redis
// It maps keys that has the folding character to a parent eg. users:1 users:2 has a common parent
// Therefore `1` and `2` will both be nodes of the parent `users`
// This is intended to build a full fledge db like interface
// Checkout redis-commander
func (u *UnRedis) GetKeysTree(prefix string) (map[string]interface{}, error) {
	keys, err := u.GetKeys(prefix)

	if err != nil {
		return nil, err
	}

	keysTreeMap := make(map[string]*keysMap)

	// convert a string like this: users:1 users:2, users:3:name, users
	// to
	// [ { users: { leaf: true, children: [ "1", "2", "3:name" ], count: 3, rel: "list" } } ]
	for _, value := range keys {
		if prefix != "" {
			value = value[(len(prefix) + len(foldingCharacter)):len(value)]
		}

		keysArray := strings.SplitN(value, foldingCharacter, 2)
		parentString := keysArray[0]

		if valueInTreeMap, ok := keysTreeMap[parentString]; ok {
			valueInTreeMap.Count += 1

			if len(keysArray) > 1 {
				valueInTreeMap.Children = append(valueInTreeMap.Children, keysArray[1])
			} else {
				valueInTreeMap.Leaf = true
			}
		} else {
			newTree := new(keysMap)
			newTree.Count = len(keysArray) - 1
			if len(keysArray) > 1 {
				newTree.Children = append(newTree.Children, keysArray[1])
			} else {
				newTree.Leaf = true
			}

			keysTreeMap[parentString] = newTree
		}
	}

	newKeysTree := make(map[string]interface{})

	for key, value := range keysTreeMap {
		newKeysTree[key] = value
	}

	return newKeysTree, nil
}

// GetKeys gets all the keys in the redis
// When prefix is not "", the search is based on the prefix
func (u *UnRedis) GetKeys(prefix string) ([]string, error) {
	reply, err := u.Connection.Do("keys", u.getPrefixString(prefix))

	if err != nil {
		return nil, err
	}

	return u.processReply(reply).([]string), nil
}

// GetServerInfo gets information regarding redis
// This is the same as typing `info` into redis-cli
func (u *UnRedis) GetServerInfo() (map[string]map[string]interface{}, error) {
	serverInfo, err := u.Connection.Do("info")
	if err != nil {
		return nil, err
	}

	responseData := make(map[string]map[string]interface{})
	serverInfoString := u.processReply(serverInfo).(string)
	infoSplits := doubleLineEnding.Split(serverInfoString, -1)

	for _, value := range infoSplits {
		serverInfoMapper := newLineEnding.Split(value, -1)
		val := serverInfoMapper[0]
		val = strings.Replace(val, "# ", "", -1)
		responseData[val] = make(map[string]interface{})

	LOOP:
		for i := 1; i < len(serverInfoMapper); i++ {
			getRowValue := strings.Split(serverInfoMapper[i], ":")
			if getRowValue[0] == "" {
				continue LOOP
			}
			if len(getRowValue) > 1 {
				keyOfInfo := getRowValue[0]
				responseData[val][keyOfInfo] = getRowValue[1]
			} else {
				responseData[val][getRowValue[0]] = ""
			}
		}
	}

	return responseData, nil
}

// Exec excutes a redis command
// The command must be accepted by the `redis-cli` otherwise it will return an error
func (u *UnRedis) Exec(command string) (interface{}, error) {
	splitCommand := strings.Split(command, " ")
	newArray := make([]interface{}, len(splitCommand)-1)

	for i := 1; i < len(splitCommand); i++ {
		newArray[i-1] = splitCommand[i]
	}

	reply, err := u.Connection.Do(splitCommand[0], newArray...)

	if err != nil {
		return nil, err
	}

	return u.processReply(reply), nil
}

// processFile reads the unredis_stats file and return an array of stats if it exists
// Let's parse the stats csv file
// Better still use golang encoding/csv to do this
// TODO: use encoding/csv package (maybe)
func (u *UnRedis) processFile() []*stat {
	fileData, err := ioutil.ReadFile("unredis_stats")

	if err != nil {
		log.Println("Error reading file. File might not exist")
		return nil
	}
	if fileData != nil {
		fileDataStr := string(fileData[:])
		fileDataStrArr := strings.Split(fileDataStr, "\n")
		newStatsArr := make([]*stat, len(fileDataStrArr))

		for i := 1; i < len(fileDataStrArr); i++ {
			value := fileDataStrArr[i]
			newStatsArr[i] = newStat(strings.Split(value, ","))
		}

		return newStatsArr
	}

	return nil
}

func (u *UnRedis) collect() (*stat, error) {
	info, err := u.GetServerInfo()

	if err != nil {
		log.Println(err)
		return nil, err
	}

	return newStatFromInfo(info), nil
}

func (u *UnRedis) SendMessageToBroker(data *stat) {
	dataToString, err := json.Marshal(data)

	if err != nil {
		log.Println(err)
	}

	u.Broker.Notifier <- dataToString
}

// CollectStats gets some necessary information regarding the redis server
// it uses a ticker to collect the stats
func (u *UnRedis) CollectStats(c chan os.Signal) chan []*stat {
	data := u.processFile()
	stats := make(chan []*stat)

	if data != nil {
		u.stats = data
	}

	go func() {
		ticker := time.NewTicker(2 * time.Second)
		for {
			select {
			case <-ticker.C:
				collectedStat, err := u.collect()
				if err != nil {
					log.Println(err)
				}

				u.Lock()
				u.stats = append(u.stats, collectedStat)
				// truncate the stats array when the length is greater than 10
				if len(u.stats) > 10 {
					u.stats = u.stats[len(u.stats)-10:]
				}
				u.Unlock()
				stats <- u.stats
				u.SendMessageToBroker(collectedStat)

			case <-c:
				ticker.Stop()
				strToWrite := statsToString(u.stats)
				ioutil.WriteFile("unredis_stats", []byte(strToWrite), 0644)
				os.Exit(0)
			}
		}
	}()

	return stats
}
