package main

import (
	// "context"
	"log"
	"os"
	"github.com/joho/godotenv"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/ai"
	"github.com/gin-gonic/gin"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/postgres"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/handler"
	// "github.com/krisikas/CU_repet_ai/back_repet_ai/internal/storage"
)

func strPtr(s string) *string {
	return &s
}

func main() {
	_ = godotenv.Load() 

	folderID := os.Getenv("YANDEX_FOLDER_ID")
	agentID := os.Getenv("YANDEX_AGENT_ID")
	apiKey := os.Getenv("YANDEX_API_KEY")

	dbHost := os.Getenv("POSTGRES_HOST")
	dbUser := os.Getenv("POSTGRES_USER")
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DBNAME")


	db, err := postgres.NewDB(dbHost, dbUser, dbPassword, dbName)
	if err != nil {
		log.Fatalf("Postgres db error: %v", err)
	}


	clientAi := ai.NewAgentClient(folderID, agentID, apiKey)
	// 2. Инициализация хендлеров
	authHandler := &handler.AuthHandler{DB: db}
	userHandler := &handler.UserHandler{DB: db}
	topicHandler := &handler.TopicHandler{DB: db}
	taskHandler := &handler.TaskHandler{
	    DB: db,
	    AI: clientAi,
	}

	// 3. Настройка роутера
	r := gin.Default()

	// Эндпоинты для мобильного приложения
	r.POST("/auth/register", authHandler.Register)
    r.POST("/auth/login", authHandler.Login)

    // 2. Защищенные маршруты (нужен токен)
    api := r.Group("/api")
    api.Use(handler.AuthMiddleware()) // Применяем проверку токена ко всей группе
    {
        api.GET("/profile", userHandler.GetProfile)
        api.GET("/topics", topicHandler.GetAvailableTopics)
        api.GET("/tasks/random", taskHandler.GetRandomTask)
        api.POST("/tasks/submit", taskHandler.SubmitTask)
        // Сюда же потом добавишь api.POST("/submit", taskHandler.Submit)
    }

	// 4. Запуск сервера
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)



	// accessKey := os.Getenv("S3_ACCESS_KEY")
	// secretKey := os.Getenv("S3_SECRET_KEY")
	// bucketKey := os.Getenv("S3_BUCKET_NAME")

	// // folderID := os.Getenv("YANDEX_FOLDER_ID")
	// // agentID := os.Getenv("YANDEX_AGENT_ID")
	// // apiKey := os.Getenv("YANDEX_API_KEY")

	// dbHost := os.Getenv("POSTGRES_HOST")
	// dbUser := os.Getenv("POSTGRES_USER")
	// dbPassword := os.Getenv("POSTGRES_PASSWORD")
	// dbName := os.Getenv("POSTGRES_DBNAME")

	// db, err := posgres.NewDB(dbHost, dbUser, dbPassword, dbName)
	// if err != nil{
	// 	log.Fatalf("Postgres db error: %v", err)
	// }
	// log.Println(db)


	// clientS3, err := storage.NewS3Client(accessKey, secretKey, bucketKey)
	// if err != nil{
	// 	log.Fatalf("Postgres db error: %v", err)
	// }
	// log.Println(clientS3)
	// clientAi := ai.NewAgentClient(folderID, agentID, apiKey)

	// ctx := context.Background()
	// res, err := clientAi.GetHint(ctx, "Реши уравнение 2x+5=10", "Перенести 5 влево и поделить обе части уравнения на 2. Ответ: x=2.5", "2.5", "Я думаю надо вычесть 5 с обоих частей. Потом на 2 поделил и ответ получил")
	// if err != nil {
	// 	log.Fatalf("Ошибка: %v", err)
	// }

	// log.Printf("Ответ для ученика: %s", res.TextForStudent)
}