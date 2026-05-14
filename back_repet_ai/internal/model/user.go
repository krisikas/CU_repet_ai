package model

import "time"

type User struct {
    ID             uint      `gorm:"primaryKey" json:"id"`
    Login          string    `gorm:"unique;not null" json:"login"`
    PasswordHash   string    `gorm:"column:password_hash;not null" json:"-"`
    Name           string    `json:"name"`
    CreatedAt      time.Time `json:"created_at"`
    LastActivityAt time.Time `gorm:"column:last_activity_at" json:"last_activity_at"`
    CurrentStreak  int       `gorm:"column:current_streak" json:"current_streak"`
    ExercisesCount int       `gorm:"column:exercises_count" json:"exercises_count"`
}

// Структуры для входящих запросов
type AuthRequest struct {
    Login    string `json:"login" binding:"required"`
    Password string `json:"password" binding:"required"`
}
type RegRequest struct {
    Login    string `json:"login" binding:"required"`
    Password string `json:"password" binding:"required"`
    Name     string `json:"name" binding:"required"`
}


type AuthResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}