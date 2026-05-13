
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,       
    password_hash VARCHAR(255) NOT NULL,    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE topics (
    code VARCHAR(50) PRIMARY KEY,  -- 'OGE_MATH_1'
    title VARCHAR(150) NOT NULL           
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    topic_code VARCHAR(50) NOT NULL,       
    content TEXT NOT NULL,                 
    correct_answer VARCHAR(255) NOT NULL,  
    difficulty INT NOT NULL DEFAULT 1,     
    FOREIGN KEY (topic_code) REFERENCES topics(code) ON DELETE CASCADE
);

CREATE TABLE user_progress (
    user_id INT NOT NULL,
    topic_code VARCHAR(50) NOT NULL,
    level FLOAT DEFAULT 0,       
    PRIMARY KEY (user_id, topic_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_code) REFERENCES topics(code) ON DELETE CASCADE
);


CREATE INDEX idx_tasks_topic_difficulty ON tasks(topic_code, difficulty);
