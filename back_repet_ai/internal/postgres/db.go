package postgres

import (
	"fmt"
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