package model

type TestAnswer struct {
	TaskID          uint   `json:"task_id"`
	TaskCode          string   `json:"task_code"`
	StudentAnswer   string `json:"student_answer"`
	StudentThoughts string `json:"student_thoughts"`
}

type TestSubmitRequest struct {
	TestID  *int         `json:"test_id"`
	Answers []TestAnswer `json:"answers"`
}

type TestAssessment struct {
	TopicCode string  `json:"topic_code"`
	Level     float64 `json:"level"`
	IsCorrect bool    `json:"is_correct"`
}

type TestAIResponse struct {
	Mode           string           `json:"mode"`
	OverallSummary string           `json:"overall_summary"`
	Assessment     []TestAssessment `json:"assessment"`
}