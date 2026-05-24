package model

type Task struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	TopicCode     string `gorm:"column:topic_code" json:"topic_code"`
	Content       string `json:"content"`
	CorrectAnswer string `gorm:"column:correct_answer" json:"correct_answer"`
	Difficulty    int    `json:"difficulty"`
}

type SubmitTaskRequest struct {
	TaskID          uint   `json:"task_id" binding:"required"`
	Mode            string `josn:"mode"`
	StudentAnswer   string `json:"student_answer"`
	StudentThoughts string `json:"student_thoughts"`
}

