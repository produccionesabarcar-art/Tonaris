CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(20) REFERENCES users(user_id),
  tonality VARCHAR(10) NOT NULL,
  correct INT NOT NULL,
  total INT NOT NULL,
  duration INT NOT NULL,
  accuracy INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);