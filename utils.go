package main

import (
	"strconv"
)

func toInt(val string) int {
	intVal, _ := strconv.Atoi(val)
	return intVal
}

func toInt64(val string) int64 {
	int64Val, _ := strconv.ParseInt(val, 10, 64)
	return int64Val
}

func toFloat(val string) float64 {
	floatVal, _ := strconv.ParseFloat(val, 64)
	return floatVal
}

func fromFloat(val float64) string {
	return strconv.FormatFloat(val, 'f', 2, 64)
}

func fromInt64(val int64) string {
	return strconv.FormatInt(val, 10)
}
