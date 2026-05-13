package storage

import (
	"fmt"
	"context"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/credentials"
)

type S3Client struct {
	client *s3.Client
	bucketName string
}

func NewS3Client(accessKey, secretKey, bucketName string) (*S3Client, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("ru-central1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, err
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = strPtr("yandexcloud.net")
	})

	return &S3Client{
		client: s3Client,
		bucketName: bucketName,
	}, nil
}

func strPtr(s string) *string {
	return &s
}

func (s *S3Client) GetUrl (imageName string) string {
	// Пока что просто создание ссылки на изображенеи
	return fmt.Sprintf("https://%s.storage.yandexcloud.net/%s", s.bucketName, imageName)
}