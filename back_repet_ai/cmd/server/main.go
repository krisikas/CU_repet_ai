package main

import (
	// "context"
	"log"
	"os"
	"github.com/joho/godotenv"
	// "github.com/krisikas/CU_repet_ai/back_repet_ai/internal/ai"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/postgres"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/storage"
)

func strPtr(s string) *string {
	return &s
}

func main() {
	_ = godotenv.Load() 
	accessKey := os.Getenv("S3_ACCESS_KEY")
	secretKey := os.Getenv("S3_SECRET_KEY")
	bucketKey := os.Getenv("S3_BUCKET_NAME")

	// folderID := os.Getenv("YANDEX_FOLDER_ID")
	// agentID := os.Getenv("YANDEX_AGENT_ID")
	// apiKey := os.Getenv("YANDEX_API_KEY")

	dbHost := os.Getenv("POSTGRES_HOST")
	dbUser := os.Getenv("POSTGRES_USER")
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DBNAME")

	db, err := posgres.NewDB(dbHost, dbUser, dbPassword, dbName)
	if err != nil{
		log.Fatalf("Postgres db error: %v", err)
	}
	log.Println(db)


	clientS3, err := storage.NewS3Client(accessKey, secretKey, bucketKey)
	if err != nil{
		log.Fatalf("Postgres db error: %v", err)
	}
	log.Println(clientS3)
	// clientAi := ai.NewAgentClient(folderID, agentID, apiKey)

	// ctx := context.Background()
	// res, err := clientAi.GetHint(ctx, "Реши уравнение 2x+5=10", "Перенести 5 влево и поделить обе части уравнения на 2. Ответ: x=2.5", "2.5", "Я думаю надо вычесть 5 с обоих частей. Потом на 2 поделил и ответ получил")
	// if err != nil {
	// 	log.Fatalf("Ошибка: %v", err)
	// }

	// log.Printf("Ответ для ученика: %s", res.TextForStudent)
}