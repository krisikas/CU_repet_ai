
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,       
    password_hash VARCHAR(255) NOT NULL,  
    name TEXT NOT NULL,    
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),
    current_streak INT DEFAULT 0,
    exercises_count INT DEFAULT 0 
);


CREATE TABLE topics (
    code VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL             
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    topic_code VARCHAR(50) NOT NULL,       
    content TEXT NOT NULL,                 
    correct_answer TEXT NOT NULL,  
    FOREIGN KEY (topic_code) REFERENCES topics(code) ON DELETE CASCADE
);

CREATE TABLE user_progress (
    user_id INT NOT NULL,
    topic_code VARCHAR(50) NOT NULL,
    level FLOAT DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_code) REFERENCES topics(code) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_topic_difficulty ON tasks(topic_code);