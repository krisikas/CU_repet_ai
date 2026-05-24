package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/postgres"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
)

// UserHandler будет отвечать за профиль и статистику
type UserHandler struct {
	DB *postgres.Postgres // Используем твой структуру обертки над БД
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	// 1. Извлекаем ID пользователя, который Middleware заботливо положил в контекст
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context missing"})
		return
	}
	userID := val.(uint)

	var user model.User
	if err := h.DB.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	now := time.Now()
	
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	lastActDay := time.Date(user.LastActivityAt.Year(), user.LastActivityAt.Month(), user.LastActivityAt.Day(), 0, 0, 0, 0, now.Location())

	daysDiff := int(today.Sub(lastActDay).Hours() / 24)

	isStreakActiveToday := (daysDiff == 0)

	if daysDiff > 1 && user.CurrentStreak > 0 {
		user.CurrentStreak = 0
		h.DB.DB.Model(&user).Update("current_streak", 0)
	}

	c.JSON(http.StatusOK, gin.H{
		"login":            user.Login,
		"current_streak":   user.CurrentStreak,
		"exercises_count":  user.ExercisesCount,
		"is_active_today":  isStreakActiveToday,
		"last_activity":    user.LastActivityAt.Format("2006-01-02 15:04:05"),
	})
}