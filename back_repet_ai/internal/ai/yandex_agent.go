package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty/v2"
)

type TopicAssessment struct {
	TopicCode string `json:"topic_code"`
	Level string `json:"level"`
	IsCorrect bool `json:"is_correct"`
}

type AgentResponse struct {
	Mode string `json:"mode"`
	TextForStudent string `json:"text_for_student"`
	InternalAnalysis string `json:"internal_analysis"`
	Assessment []TopicAssessment `json:"assessment"`
}

type AgentClient struct {
	httpClient *resty.Client
	folderID string
	agentID string
	apiKey string
}

func NewAgentClient(folderID, agentID, apiKey string) *AgentClient {
	return &AgentClient{
		httpClient: resty.New(),
		folderID:   folderID,
		agentID:    agentID,
		apiKey:     apiKey,
	}
}

type YandexResponseWrapper struct {
	Output []struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
}

func (c *AgentClient) GetHint(ctx context.Context, taskText, taskAnswer, studentAnswer, studentThoughts string) (*AgentResponse, error) {
	
	prompt := fmt.Sprintf(
		"{\"mode\": \"hint\", \"task\": \"%s\", \"correct_answer\": \"%s\", \"student_answer\": \"%s\", \"student_thoughts\": \"%s\"", 
		taskText, taskAnswer, studentAnswer, studentThoughts)

	// URL для вызова агента (актуальный на 2026 год для Yandex Cloud)
	url := fmt.Sprintf("https://ai.api.cloud.yandex.net/v1/responses")

	// Формируем Payload согласно документации Яндекс Облака для Агентов
	payload := map[string]interface{}{
        "prompt": map[string]string{
            "id": c.agentID, // Тот самый ID агента
        },
        "input": prompt, // Сообщение от ученика
    }


	resp, err := c.httpClient.R().
		// SetContext(ctx).
		SetHeader("Content-Type", "application/json").
		SetHeader("Authorization", "Api-Key "+c.apiKey).
		SetHeader("OpenAI-Project", c.folderID).
		SetBody(payload).
		Post(url)

	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	if resp.IsError() {
		return nil, fmt.Errorf("api error: %s", resp.String())
	}



	var wrapper struct {
        Output []struct {
            Content []struct {
                Text string `json:"text"`
            } `json:"content"`
        } `json:"output"`
    }

    if err := json.Unmarshal(resp.Body(), &wrapper); err != nil {
        return nil, fmt.Errorf("failed to unmarshal yandex wrapper: %w", err)
    }

    if len(wrapper.Output) == 0 || len(wrapper.Output[0].Content) == 0 {
        return nil, fmt.Errorf("empty response from ai")
    }

    aiRawJSON := wrapper.Output[0].Content[0].Text

    var result AgentResponse
    if err := json.Unmarshal([]byte(aiRawJSON), &result); err != nil {
        return nil, fmt.Errorf("failed to parse AI business logic JSON: %w", err)
    }

	return &result, nil
}
