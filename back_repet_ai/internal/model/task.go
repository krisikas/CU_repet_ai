package model

// Task описывает таблицу tasks в базе данных для GORM
type Task struct {
    ID            uint   `gorm:"primaryKey" json:"id"`
    TopicCode     string `gorm:"column:topic_code" json:"topic_code"`
    Content       string `json:"content"`
    CorrectSolution string `gorm:"column:correct_answer" json:"correct_answer"`
    Difficulty    int    `json:"difficulty"`
}