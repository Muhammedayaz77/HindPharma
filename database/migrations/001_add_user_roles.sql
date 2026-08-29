-- Run once against the existing PostgreSQL database after deploying this version.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));

-- Existing accounts: Ayaz is the administrator; HindPharma remains a normal user.
UPDATE users SET role = 'admin' WHERE LOWER(username) = 'ayaz';
UPDATE users SET role = 'user' WHERE LOWER(username) = 'hindpharma';
