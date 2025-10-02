-- Reset password for forex_user
ALTER USER forex_user WITH PASSWORD 'forex123';

-- Verify the user exists
SELECT usename FROM pg_user WHERE usename = 'forex_user';

-- Check database ownership
SELECT datname, datdba, (SELECT usename FROM pg_user WHERE usesysid = datdba) as owner 
FROM pg_database WHERE datname = 'forex_prediction';
