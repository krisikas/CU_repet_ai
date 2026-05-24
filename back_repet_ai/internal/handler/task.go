package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/postgres"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/ai"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
)

type TaskHandler struct {
	DB *postgres.Postgres
	AI *ai.AgentClient
}

func (h *TaskHandler) GetRandomTask(c *gin.Context) {
	topicCode := c.Query("topic")
	if topicCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter 'topic' is required"})
		return
	}

	task, err := h.DB.GetRandomTaskByTopic(topicCode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No tasks found for this topic"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"task_id": task.ID,
		"topic":   task.TopicCode,
		"content": task.Content,
	})
}




func (h *TaskHandler) SubmitTask(c *gin.Context) {
	userID, _ := c.Get("user_id")
		h.DB.UpdateLearningProgress(userID.(uint))
		return
	var req model.SubmitTaskRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	task, err := h.DB.GetTaskByID(req.TaskID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	var aiRes *ai.AgentTaskResponse
	var aiErr error

	if req.Mode == "hint" {
		aiRes, aiErr = h.AI.GetHint(c.Request.Context(), task.Content, task.CorrectAnswer, req.StudentThoughts)
	}else if req.Mode == "check" {
		aiRes, aiErr = h.AI.CheckAnswer(c.Request.Context(), task.Content, task.CorrectAnswer, req.StudentAnswer, req.StudentThoughts)
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid mode"})
		return
	}
	if aiErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service error: " + err.Error()})
		return
	}

	if aiRes.CorrectAnswer {
		h.DB.UpdateLearningProgress(userID.(uint))
	}

	c.JSON(http.StatusOK, gin.H{
		"mode":            aiRes.Mode,
		"ai_response":     aiRes.TextForStudent,
		"is_correct":      aiRes.CorrectAnswer,
	})
}