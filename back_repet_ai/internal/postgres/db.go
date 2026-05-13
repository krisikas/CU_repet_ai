package posgres

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	_ "github.com/krisikas/CU_repet_ai/back_repet_ai/internal/model"
)



type Postgres struct {
	db *gorm.DB
}

func NewDB(host, user, password, dbname string) (*Postgres, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable", 
		host, user, password, dbname)
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return &Postgres{
		db: db,
	}, nil
}
