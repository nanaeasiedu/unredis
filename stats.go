package main

import (
	"reflect"
	"strings"
	"time"
)

const (
	OpsPerSec = iota
	HitRate
	UsedMemory
	MemoryFragmentationRatio
	EvictedKeys
	BlockedClients
	ConnectedClients
	ConnectedSlaves
	KeyspaceHits
	RDBLastSaveTime
	RDBChangesSinceLastSave
	RejectedConnections
	KeySpaceMisses
	CreatedAt
)

const (
	fileHeader = "instantaneous_ops_per_sec,hit_rate,used_memory,mem_fragmentation_ratio,evicted_keys,blocked_clients,connected_clients,connected_slaves,keyspace_hits,rdb_last_save_time,rdb_changes_since_last_save,rejected_conncections,keyspace_misses,created_at"
)

type stat struct {
	OpsPerSec                int     `json:"instantaneous_ops_per_sec"`
	HitRate                  float64 `json:"hit_rate"`
	UsedMemory               float64 `json:"used_memory"`
	MemoryFragmentationRatio float64 `json:"mem_fragmentation_ratio"`
	EvictedKeys              int     `json:"evicted_keys"`
	BlockedClients           int     `json:"blocked_clients"`
	ConnectedClients         int     `json:"connected_clients"`
	ConnectedSlaves          int     `json:"connected_slaves"`
	KeyspaceHits             int     `json:"keyspace_hits"`
	RDBLastSaveTime          int64   `json:"rdb_last_save_time"`
	RDBChangesSinceLastSave  int     `json:"rdb_changes_since_last_save"`
	RejectedConnections      int     `json:"rejected_connections"`
	KeySpaceMisses           int     `json:"keyspace_misses"`
	CreatedAt                int64   `json:"created_at"`
}

func (stat *stat) toString() string {
	structValue := reflect.ValueOf(*stat)
	constructStr := ""

	for j := 0; j < structValue.NumField(); j++ {
		val := structValue.Field(j)
		var valStr string

		switch val.Kind() {
		case reflect.Int64:
			valStr = fromInt64(val.Int())
		case reflect.Int:
			valStr = fromInt64(int64(val.Interface().(int)))
		case reflect.Float64:
			valStr = fromFloat(val.Float())
		}

		if j+1 == structValue.NumField() {
			constructStr += valStr
		} else {
			constructStr += valStr + ","
		}
	}

	return constructStr
}

func newStat(valueArr []string) *stat {
	unRedisStat := new(stat)

	unRedisStat.OpsPerSec = toInt(valueArr[OpsPerSec])
	unRedisStat.HitRate = toFloat(valueArr[HitRate])
	unRedisStat.UsedMemory = toFloat(valueArr[UsedMemory])
	unRedisStat.MemoryFragmentationRatio = toFloat(valueArr[MemoryFragmentationRatio])
	unRedisStat.EvictedKeys = toInt(valueArr[EvictedKeys])
	unRedisStat.BlockedClients = toInt(valueArr[BlockedClients])
	unRedisStat.ConnectedClients = toInt(valueArr[ConnectedClients])
	unRedisStat.ConnectedSlaves = toInt(valueArr[ConnectedSlaves])
	unRedisStat.KeyspaceHits = toInt(valueArr[KeyspaceHits])
	unRedisStat.RDBLastSaveTime = toInt64(valueArr[RDBLastSaveTime])
	unRedisStat.RDBChangesSinceLastSave = toInt(valueArr[RDBChangesSinceLastSave])
	unRedisStat.RejectedConnections = toInt(valueArr[RejectedConnections])
	unRedisStat.KeySpaceMisses = toInt(valueArr[KeySpaceMisses])
	unRedisStat.CreatedAt = toInt64(valueArr[CreatedAt])

	return unRedisStat
}

func newStatFromInfo(info map[string]map[string]interface{}) *stat {
	statArr := make([]string, CreatedAt+1)

	statArr[OpsPerSec] = (info["Stats"]["instantaneous_ops_per_sec"]).(string)
	statArr[UsedMemory] = (info["Memory"]["used_memory"]).(string)
	statArr[MemoryFragmentationRatio] = (info["Memory"]["mem_fragmentation_ratio"]).(string)
	statArr[EvictedKeys] = (info["Stats"]["evicted_keys"]).(string)
	statArr[BlockedClients] = (info["Clients"]["blocked_clients"]).(string)
	statArr[ConnectedClients] = (info["Clients"]["connected_clients"]).(string)
	statArr[ConnectedSlaves] = (info["Replication"]["connected_slaves"]).(string)
	statArr[KeyspaceHits] = (info["Stats"]["keyspace_hits"]).(string)
	statArr[RDBLastSaveTime] = (info["Persistence"]["rdb_last_save_time"]).(string)
	statArr[RDBChangesSinceLastSave] = (info["Persistence"]["rdb_changes_since_last_save"]).(string)
	statArr[RejectedConnections] = (info["Stats"]["rejected_connections"]).(string)
	statArr[KeySpaceMisses] = (info["Stats"]["keyspace_misses"]).(string)
	statArr[CreatedAt] = fromInt64(time.Now().UnixNano() / (int64(time.Millisecond) / int64(time.Nanosecond)))

	if toInt(statArr[KeyspaceHits]) == 0 {
		statArr[HitRate] = "0"
	} else {
		val := toFloat(statArr[KeyspaceHits]) / (toFloat(statArr[KeyspaceHits]) + toFloat(statArr[KeySpaceMisses]))
		statArr[HitRate] = fromFloat(val)
	}

	return newStat(statArr)
}

func statsToString(stats []*stat) string {
	if len(stats) > 0 {
		statToFile := make([]string, len(stats)+1)

		statToFile[0] = fileHeader
		for i, stat := range stats {
			statToFile[i+1] = stat.toString()
		}

		return strings.Join(statToFile, "\n")
	}

	return ""
}
