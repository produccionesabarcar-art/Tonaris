CREATE TABLE IF NOT EXISTS skill_mastery (
  user_id      VARCHAR(20) REFERENCES users(user_id),
  skill_id     VARCHAR(30) NOT NULL,
  mastery      VARCHAR(10) NOT NULL DEFAULT 'unknown',
  accuracy_7d  NUMERIC,
  avg_ms_7d    INT,
  updated_at   TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);
