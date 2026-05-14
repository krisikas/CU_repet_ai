package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/postgres"
)

type TopicHandler struct {
	DB *postgres.Postgres
}

func (h *TopicHandler) GetAvailableTopics(c *gin.Context) {
	userID, _ := c.Get("user_id")

	prefix := c.Query("prefix")
	if prefix == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Prefix query parameter is required"})
		return
	}

	topics, err := h.DB.GetUserTopicsByPrefix(userID.(uint), prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"catalog": prefix,
		"topics":  topics,
	})
}