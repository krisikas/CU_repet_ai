package handler

import (
	"net/http"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/ai"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/postgres"
)

type ChatHandler struct {
	DB *postgres.Postgres
	AI *ai.AgentClient
}

func (h *ChatHandler) SendChatMessage(c *gin.Context) {
	var req model.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	topicTitle, _ := h.DB.GetTopicTitle(req.TopicID)

	instruction := fmt.Sprintf("Контекст темы: %s. Вопрос ученика: %s", topicTitle, req.Message)
	
	aiRes, err := h.AI.GetHint(c.Request.Context(), instruction, "Объясни теорию mode:explanation", req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable"})
		return
	}

	// 3. Возвращаем ответ в формате, который ждет мобилка (data.ai_response)
	c.JSON(http.StatusOK, model.ChatResponse{
		AiResponse: aiRes.TextForStudent,
	})
}