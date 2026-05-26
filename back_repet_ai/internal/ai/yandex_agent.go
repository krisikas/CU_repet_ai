package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty/v2"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
)

type TopicAssessment struct {
	TopicCode string `json:"topic_code"`
	Level string `json:"level"`
	IsCorrect bool `json:"is_correct"`
}

type AgentTaskResponse struct {
	Mode string `json:"mode"`
	TextForStudent string `json:"text_for_student"`
	CorrectAnswer bool `json:"correct_answer"`
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

func (c *AgentClient) GetHint(ctx context.Context, taskText, taskAnswer, studentThoughts string) (*AgentTaskResponse, error) {
	
	prompt := fmt.Sprintf("[MODE]: hing\n [TASK_CONTENT]: %s\n[CORRECT_ANSWER]: %s\n[USER_THOUGHTS]: %s",
        taskText, taskAnswer, studentThoughts,
    )
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

    var result AgentTaskResponse
    if err := json.Unmarshal([]byte(aiRawJSON), &result); err != nil {
        return nil, fmt.Errorf("failed to parse AI business logic JSON: %w", err)
    }

	return &result, nil
}


func (c *AgentClient) CheckAnswer(ctx context.Context, taskText, taskAnswer, studentAnswer, studentThoughts string) (*AgentTaskResponse, error) {
	
	prompt := fmt.Sprintf("[MODE]: submit\n [TASK_CONTENT]: %s\n[CORRECT_ANSWER]: %s\n[USER_ANSWER]: %s\n[USER_THOUGHTS]: %s",
        taskText, taskAnswer, studentAnswer, studentThoughts,
    )
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

    var result AgentTaskResponse
    if err := json.Unmarshal([]byte(aiRawJSON), &result); err != nil {
        return nil, fmt.Errorf("failed to parse AI business logic JSON: %w", err)
    }

	return &result, nil
}


func (c *AgentClient) GetTestAnalysis(ctx context.Context, fullTestData string) (*model.TestAIResponse, error) {

	prompt := fmt.Sprintf("{\"mode\": \"test\", \"data\": \"%s\"}", fullTestData)

	url := "https://ai.api.cloud.yandex.net/v1/responses"

	payload := map[string]interface{}{
		"prompt": map[string]string{
			"id": c.agentID,
		},
		"input": prompt,
	}

	resp, err := c.httpClient.R().
		SetContext(ctx).
		SetHeader("Content-Type", "application/json").
		SetHeader("Authorization", "Api-Key "+c.apiKey).
		SetHeader("x-folder-id", c.folderID).
		SetBody(payload).
		Post(url)

	if err != nil {
		return nil, fmt.Errorf("network error: %w", err)
	}

	if resp.IsError() {
		return nil, fmt.Errorf("yandex api error (status %d): %s", resp.StatusCode(), resp.String())
	}

	var wrapper struct {
		Output []struct {
			Content []struct {
				Text string `json:"text"`
			} `json:"content"`
		} `json:"output"`
	}

	if err := json.Unmarshal(resp.Body(), &wrapper); err != nil {
		return nil, fmt.Errorf("failed to unmarshal yandex response: %w", err)
	}

	if len(wrapper.Output) == 0 || len(wrapper.Output[0].Content) == 0 {
		return nil, fmt.Errorf("ai returned empty content")
	}

	aiRawJSON := wrapper.Output[0].Content[0].Text

	fmt.Println(aiRawJSON)
	var result model.TestAIResponse
	if err := json.Unmarshal([]byte(aiRawJSON), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI business logic: %w. Raw text: %s", err, aiRawJSON)
	}

	return &result, nil
}
