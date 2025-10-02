-- Create a new database and user for the forex prediction system
-- This script will create a dedicated user and database

-- Create a new user
CREATE USER forex_user WITH PASSWORD 'forex123';

-- Create the database
CREATE DATABASE forex_prediction OWNER forex_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE forex_prediction TO forex_user;

-- Connect to the new database
\c forex_prediction;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO forex_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO forex_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO forex_user;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Display success message
SELECT 'Database setup completed successfully!' as status;
