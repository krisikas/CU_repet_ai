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

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	lastAct := time.Date(user.LastActivityAt.Year(), user.LastActivityAt.Month(), user.LastActivityAt.Day(), 0, 0, 0, 0, user.LastActivityAt.Location())

	daysDiff := int(today.Sub(lastAct).Hours() / 24)

	switch {
	case daysDiff == 0 && user.CurrentStreak == 0:
		user.CurrentStreak = 1
	case daysDiff == 1:
		user.CurrentStreak++
	case daysDiff > 1:
		user.CurrentStreak = 1
	}

	user.ExercisesCount++

	user.LastActivityAt = now
	if err := p.DB.Save(&user).Error; err != nil {
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