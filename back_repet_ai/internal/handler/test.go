package handler

import (
	"fmt"
	"log"
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

	tasks, err := h.DB.GetOneTaskPerTopic(subject)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
		return
	}

	if len(tasks) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Задачи не найдены. Проверь базу!"})
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

	c.JSON(http.StatusOK, gin.H{
		"test_id": int(time.Now().Unix()),
		"tasks":   responseTasks,
	})
}

func (h *TaskHandler) SubmitFullTest(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req model.TestSubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err, req)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	var fullPromptData string
	for _, ans := range req.Answers {
		task, _ := h.DB.GetTaskByID(ans.TaskID)
		fullPromptData += fmt.Sprintf(
			"\n ID: %d\nContent: %s\nCorrect: %s\nStudent: %s\nThoughts: %s\n---",
			ans.TaskCode, task.Content, task.CorrectAnswer, ans.StudentAnswer, ans.StudentThoughts,
		)
	}
	fmt.Println(fullPromptData)

	aiRes, err := h.AI.GetTestAnalysis(c.Request.Context(), fullPromptData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI fail"})
		return
	}

	for _, res := range aiRes.Assessment {
	    err := h.DB.UpdateTopicProgress(userID.(uint), res.TopicCode, res.Level)
	    if err != nil {
	        log.Printf("Ошибка обновления прогресса для темы %s: %v", res.TopicCode, err)
	    }

	    if res.IsCorrect {
	        _, _, _ = h.DB.UpdateLearningProgress(userID.(uint))
	    }
	}

	c.JSON(http.StatusOK, aiRes)
}