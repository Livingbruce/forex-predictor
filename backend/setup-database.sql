-- PostgreSQL Database Setup Script for Forex Prediction System
-- Run this script to create the database and user

-- Create database
CREATE DATABASE forex_prediction;

-- Create user (optional, you can use existing postgres user)
-- CREATE USER forex_user WITH PASSWORD 'forex_password';

-- Grant privileges
-- GRANT ALL PRIVILEGES ON DATABASE forex_prediction TO forex_user;

-- Connect to the database
\c forex_prediction;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by Sequelize when the application starts
-- This script just sets up the database infrastructure

-- Optional: Create a schema for better organization
-- CREATE SCHEMA IF NOT EXISTS forex_data;
-- CREATE SCHEMA IF NOT EXISTS ai_analysis;
-- CREATE SCHEMA IF NOT EXISTS user_management;

COMMENT ON DATABASE forex_prediction IS 'Forex Prediction System Database - Stores live data, AI analysis, backtest results, and user preferences';
