CREATE TABLE IF NOT EXISTS user_rewards (
  reward_id   VARCHAR(30) PRIMARY KEY,
  user_id     VARCHAR(20) REFERENCES users(user_id),
  reward_type VARCHAR(30) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW()
);
