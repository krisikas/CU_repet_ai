package model

type ChatRequest struct {
	TopicID string `json:"topic_id"`
	Message string `json:"message"`
}

type ChatResponse struct {
	AiResponse string `json:"ai_response"`
}