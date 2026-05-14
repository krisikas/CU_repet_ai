package model

type Topic struct {
	Code  string `gorm:"primaryKey" json:"code"`
	Title string `json:"title"`
}