package main

type apiResponse struct {
	Data    interface{} `json:"data,omitempty"`
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
}

func newSuccessResponse(data interface{}) apiResponse {
	return apiResponse{
		Data:   data,
		Status: "success",
	}
}

func newErrorResponse(status string) apiResponse {
	return apiResponse{
		Status:  "error",
		Message: status,
	}
}
