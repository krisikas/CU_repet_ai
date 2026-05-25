package postgres

import (
	"fmt"
	"time"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
)

type Postgres struct {
	DB *gorm.DB
}

func NewDB(host, user, password, dbname string) (*Postgres, error) {
	fmt.Println(dbname)
	dsn := fmt.Sprintf("postgres://%s:%s@%s:5432/%s?sslmode=disable", 
		user, password, host, dbname)

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
	}), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	db.AutoMigrate(&model.User{})

	return &Postgres{DB: db}, nil
}

func (p *Postgres) CreateUser(user *model.User) error {
	return p.DB.Create(user).Error
}

func (p *Postgres) GetUserByLogin(login string) (*model.User, error) {
	var user model.User
	err := p.DB.Where("login = ?", login).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (p *Postgres) UpdateLearningProgress(userID uint) (int, int, error) {
	var user model.User
	if err := p.DB.First(&user, userID).Error; err != nil {
		return 0, 0, err
	}

	now := time.Now().UTC()

	todayStr := now.Format("2006-01-02")
	lastActStr := user.LastActivityAt.UTC().Format("2006-01-02")

	today, _ := time.Parse("2006-01-02", todayStr)
	lastAct, _ := time.Parse("2006-01-02", lastActStr)

	daysDiff := int(today.Sub(lastAct).Hours() / 24)

	switch {
	case daysDiff == 1:
		user.CurrentStreak++
	case daysDiff > 1 || (daysDiff == 0 && user.CurrentStreak == 0):
		user.CurrentStreak = 1
	}

	user.ExercisesCount++
	user.LastActivityAt = now

	if err := p.DB.Model(&user).Select("CurrentStreak", "ExercisesCount", "LastActivityAt").Updates(&user).Error; err != nil {
		return 0, 0, err
	}

	return user.CurrentStreak, user.ExercisesCount, nil
}




func (p *Postgres) GetUserTopicsByPrefix(userID uint, prefix string) ([]model.TopicWithProgress, error) {
	var results []model.TopicWithProgress

	// например 'OGE_MATH%'
	err := p.DB.Table("topics").
		Select("topics.code, topics.title, user_progress.level").
		Joins("JOIN user_progress ON user_progress.topic_code = topics.code").
		Where("user_progress.user_id = ? AND topics.code LIKE ?", userID, prefix+"_%").
		Scan(&results).Error

	return results, err
}

func (p *Postgres) GetRandomTaskByTopic(topicCode string) (*model.Task, error) {
	var task model.Task
	
	err := p.DB.Where("topic_code = ?", topicCode).
		Order("RANDOM()").
		First(&task).Error

	if err != nil {
		return nil, err
	}
	return &task, nil
}


func (p *Postgres) GetTaskByID(id uint) (*model.Task, error) {
	var task model.Task
	err := p.DB.First(&task, id).Error
	return &task, err
}

func (p *Postgres) UpdateTopicProgress(userID uint, topicCode string, newLevel float64) error {
	return p.DB.Exec(`
		INSERT INTO user_progress (user_id, topic_code, level, updated_at)
		VALUES (?, ?, ?, NOW())
		ON CONFLICT (user_id, topic_code)
		DO UPDATE SET level = EXCLUDED.level, updated_at = NOW()`,
		userID, topicCode, newLevel).Error
}
func (p *Postgres) GetTasksBySubject(subjectPrefix string, limit int) ([]model.Task, error) {
	var tasks []model.Task
	
	err := p.DB.Where("topic_code LIKE ?", subjectPrefix+"%").
		Order("RANDOM()").
		Limit(limit).
		Find(&tasks).Error

	return tasks, err
}