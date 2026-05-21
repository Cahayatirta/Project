CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
    CREATE TYPE gender_enum AS ENUM ('male', 'female');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_location_enum') THEN
    CREATE TYPE work_location_enum AS ENUM ('on_site', 'hybrid', 'anywhere');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_status_enum') THEN
    CREATE TYPE social_status_enum AS ENUM ('pending', 'accepted', 'declined', 'blocked');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email_address VARCHAR(150) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  birth_date DATE,
  gender gender_enum,
  job VARCHAR(150),
  work_location work_location_enum,
  hobby VARCHAR(150),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  screen_time NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sleep_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  stress_level NUMERIC(10, 2) NOT NULL DEFAULT 0,
  wellness_index NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sleep_quality NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fatigue_score NUMERIC(10, 2) NOT NULL DEFAULT 0,
  digital_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  screen_time_category VARCHAR(100),
  physical_activity VARCHAR(100),
  caffeine_intake NUMERIC(10, 2) NOT NULL DEFAULT 0,
  work_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  mood VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (id_user, date)
);

CREATE TABLE IF NOT EXISTS socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status social_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT socials_distinct_users CHECK (user_sender_id <> user_receiver_id),
  CONSTRAINT socials_unique_pair UNIQUE (user_sender_id, user_receiver_id)
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_group UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (id_group, id_user)
);

CREATE TABLE IF NOT EXISTS group_history_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_group UUID NOT NULL UNIQUE REFERENCES groups(id) ON DELETE CASCADE,
  can_view_screen_time BOOLEAN NOT NULL DEFAULT false,
  can_view_sleep_hours BOOLEAN NOT NULL DEFAULT false,
  can_view_wellness_index BOOLEAN NOT NULL DEFAULT false,
  can_view_sleep_quality BOOLEAN NOT NULL DEFAULT false,
  can_view_fatigue_score BOOLEAN NOT NULL DEFAULT false,
  can_view_digital_balance BOOLEAN NOT NULL DEFAULT false,
  can_view_screen_time_category BOOLEAN NOT NULL DEFAULT false,
  can_view_physical_activity BOOLEAN NOT NULL DEFAULT false,
  can_view_caffeine_intake BOOLEAN NOT NULL DEFAULT false,
  can_view_work_hours BOOLEAN NOT NULL DEFAULT false,
  can_view_mood BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email_address ON users(email_address);
CREATE INDEX IF NOT EXISTS idx_histories_user_date ON histories(id_user, date DESC);
CREATE INDEX IF NOT EXISTS idx_socials_sender ON socials(user_sender_id, status);
CREATE INDEX IF NOT EXISTS idx_socials_receiver ON socials(user_receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_groups_owner ON groups(id_user);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(id_group);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(id_user);

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_histories_set_updated_at ON histories;
CREATE TRIGGER trg_histories_set_updated_at
BEFORE UPDATE ON histories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_socials_set_updated_at ON socials;
CREATE TRIGGER trg_socials_set_updated_at
BEFORE UPDATE ON socials
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_groups_set_updated_at ON groups;
CREATE TRIGGER trg_groups_set_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_group_history_permissions_set_updated_at ON group_history_permissions;
CREATE TRIGGER trg_group_history_permissions_set_updated_at
BEFORE UPDATE ON group_history_permissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
