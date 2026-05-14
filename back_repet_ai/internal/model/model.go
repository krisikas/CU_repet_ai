package model

import "time"

type User struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    Login        string    `gorm:"unique;not null" json:"login"`
    PasswordHash string    `gorm:"column:password_hash;not null" json:"-"` // "-" скрывает поле из JSON
    LastSeen   time.Time `json:"last_seen" json:"last_seen"`
    CreatedAt    time.Time `json:"created_at"`
}

// Структуры для входящих запросов
type AuthRequest struct {
    Login    string `json:"login" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}