package model

import "time"

type UserProgress struct {
	UserID    uint      `gorm:"primaryKey;column:user_id" json:"user_id"`
	TopicCode string    `gorm:"primaryKey;column:topic_code" json:"topic_code"`
	Level     float64   `json:"level"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TopicWithProgress struct {
	Code  string  `json:"code"`
	Title string  `json:"title"`
	Level float64 `json:"level"`
}