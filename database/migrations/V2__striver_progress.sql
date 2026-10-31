-- Add durable progress for the bundled Striver catalog. This is deliberately
-- additive and does not alter or rewrite the existing V1 migration.
CREATE TABLE IF NOT EXISTS user_striver_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_key VARCHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('ATTEMPTED', 'SOLVED', 'REVISION')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  first_attempted_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  CONSTRAINT user_striver_progress_user_problem_unique UNIQUE (user_id, problem_key)
);
CREATE INDEX IF NOT EXISTS idx_user_striver_progress_user_id
  ON user_striver_progress(user_id);
