CREATE TABLE IF NOT EXISTS exercise_results (
  result_id   VARCHAR(30)  PRIMARY KEY,
  session_id  VARCHAR(20)  REFERENCES sessions(session_id),
  user_id     VARCHAR(20)  REFERENCES users(user_id),
  interval    VARCHAR(20)  NOT NULL,
  is_correct  BOOLEAN      NOT NULL,
  response_ms INT,
  created_at  TIMESTAMP    DEFAULT NOW()
);