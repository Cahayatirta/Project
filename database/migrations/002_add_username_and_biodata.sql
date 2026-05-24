ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS biodata TEXT;

UPDATE users
SET username = LOWER(SPLIT_PART(email_address, '@', 1))
WHERE username IS NULL;

ALTER TABLE users
ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
