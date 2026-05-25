package handler

import (
	"fmt"
	"time"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
)


func (h *TaskHandler) StartTest(c *gin.Context) {
	subject := c.Query("subject")
	if subject == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subject is required"})
		return
	}

	tasks, err := h.DB.GetTasksBySubject(subject, 5)
	if err != nil || len(tasks) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Задачи по этому предмету не найдены"})
		return
	}

	type TaskResponse struct {
		TaskID    uint   `json:"task_id"`
		TopicCode string `json:"topic_code"`
		Content   string `json:"content"`
	}

	var responseTasks []TaskResponse
	for _, t := range tasks {
		responseTasks = append(responseTasks, TaskResponse{
			TaskID:    t.ID,
			TopicCode: t.TopicCode,
			Content:   t.Content,
		})
	}

	testID := int(time.Now().Unix())

	c.JSON(http.StatusOK, gin.H{
		"test_id": testID,
		"tasks":   responseTasks,
	})
}
func (h *TaskHandler) SubmitFullTest(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req model.TestSubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	var fullPromptData string
	for _, ans := range req.Answers {
		task, _ := h.DB.GetTaskByID(ans.TaskID)
		fullPromptData += fmt.Sprintf(
			"\n ID: %d\nContent: %s\nCorrect: %s\nStudent: %s\nThoughts: %s\n---",
			ans.TaskID, task.Content, task.CorrectAnswer, ans.StudentAnswer, ans.StudentThoughts,
		)
	}
	fmt.Println(fullPromptData)

	aiRes, err := h.AI.GetTestAnalysis(c.Request.Context(), fullPromptData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI fail"})
		return
	}

	for _, res := range aiRes.Assessment {
		_ = h.DB.UpdateTopicProgress(userID.(uint), res.TopicCode, res.Level)
		if res.IsCorrect {
			_, _, _ = h.DB.UpdateLearningProgress(userID.(uint))
		}
	}

	c.JSON(http.StatusOK, aiRes)
}