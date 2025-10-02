# Forex Prediction System - Database & WebSocket Setup

## 🚀 New Features Added

### 1. PostgreSQL Database Integration
- **Unlimited Growth**: Store unlimited historical data, backtests, and AI analysis results
- **Data Persistence**: All intelligence data is now stored permanently
- **Performance**: Optimized indexes for fast queries
- **Scalability**: Ready for production deployment

### 2. WebSocket Real-Time Data
- **Finnhub Integration**: Real-time forex data streaming
- **No Rate Limits**: Continuous data flow without API restrictions
- **Multiple Providers**: Support for 3 WebSocket and 3 REST API providers
- **Auto-Reconnection**: Robust connection management

### 3. User API Key Management
- **Personal API Keys**: Each user can configure their own API keys
- **3 WebSocket Slots**: Finnhub, Alpha Vantage, Twelve Data
- **3 REST API Slots**: Alpha Vantage, Twelve Data, Exchange Rates
- **Security**: API keys are masked in the UI
- **Validation**: Real-time API key format validation

## 📋 Setup Instructions

### 1. Install PostgreSQL

#### Windows:
```bash
# Download and install PostgreSQL from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

#### macOS:
```bash
# Using Homebrew:
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Run the setup script
\i backend/setup-database.sql

# Or manually:
CREATE DATABASE forex_prediction;
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Copy the example file
cp backend/env.example backend/.env

# Edit the .env file with your database credentials:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=forex_prediction
DB_USER=postgres
DB_PASSWORD=your_password_here

# Default API Keys (will be overridden by user keys)
FINNHUB_API_KEY=d3cp4nhr01qmnfgen0ugd3cp4nhr01qmnfgen0v0
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
TWELVE_DATA_API_KEY=your_twelve_data_key_here
EXCHANGE_RATES_API_KEY=your_exchange_rates_key_here
```

### 4. Install Dependencies

```bash
# Backend dependencies (already installed)
cd backend
npm install pg sequelize ws socket.io-client dotenv

# Frontend dependencies
cd ../frontend
npm install
```

### 5. Start the System

```bash
# Terminal 1: Start PostgreSQL (if not running as service)
sudo systemctl start postgresql

# Terminal 2: Start Backend
cd backend
node intelligent-backend.js

# Terminal 3: Start Frontend
cd frontend
npm start
```

## 🔑 API Key Configuration

### Getting API Keys:

1. **Finnhub (Recommended for WebSocket)**:
   - Visit: https://finnhub.io
   - Sign up for free account
   - Get API key from dashboard
   - Free tier: 60 calls/minute

2. **Alpha Vantage**:
   - Visit: https://www.alphavantage.co
   - Sign up for free account
   - Get API key from dashboard
   - Free tier: 5 calls/minute, 500 calls/day

3. **Twelve Data**:
   - Visit: https://twelvedata.com
   - Sign up for free account
   - Get API key from dashboard
   - Free tier: 8 calls/minute, 800 calls/day

### Using the API Key Manager:

1. Navigate to "API Key Manager" in the sidebar
2. Select "WebSocket APIs" or "REST APIs"
3. Choose your provider
4. Enter your API key
5. Click "Save API Key"

## 📊 Database Schema

### Tables Created:

1. **user_api_keys**: User API key management
2. **forex_data**: Live and historical forex data
3. **ai_analysis**: AI analysis results and predictions
4. **backtest_results**: Backtesting results and performance metrics
5. **trading_signals**: Trading signals and recommendations
6. **system_metrics**: System performance and monitoring data

### Indexes:
- Optimized for fast queries on currency pairs and timestamps
- Composite indexes for multi-column searches
- Automatic index creation on startup

## 🌐 WebSocket Features

### Real-Time Data Flow:
- **Continuous Streaming**: No more rate limit restrictions
- **Multiple Pairs**: Support for all major forex pairs
- **Data Persistence**: All data stored in PostgreSQL
- **Auto-Reconnection**: Robust connection management

### Supported Currency Pairs:
- EUR/USD, GBP/USD, USD/JPY
- AUD/USD, USD/CAD, USD/CHF
- NZD/USD, EUR/GBP, EUR/JPY, GBP/JPY

## 🔧 Troubleshooting

### Database Connection Issues:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l

# Test connection
psql -h localhost -U postgres -d forex_prediction
```

### WebSocket Connection Issues:
- Check API key validity
- Verify internet connection
- Check firewall settings
- Review backend logs for connection errors

### API Key Issues:
- Ensure API key format is correct
- Check API key permissions
- Verify API key is not expired
- Test API key with provider's documentation

## 📈 Performance Benefits

### Before (API-based):
- ❌ Rate limited to 5-8 calls/minute
- ❌ Data lost on restart
- ❌ Limited historical data
- ❌ Shared API keys

### After (Database + WebSocket):
- ✅ Unlimited real-time data
- ✅ Permanent data storage
- ✅ Unlimited historical data
- ✅ Personal API keys
- ✅ Better performance
- ✅ Production ready

## 🚀 Next Steps

1. **Configure your API keys** in the API Key Manager
2. **Monitor WebSocket connections** in the backend logs
3. **Check database growth** - data is stored permanently
4. **Scale as needed** - system is ready for production

The system is now enterprise-ready with unlimited data storage and real-time streaming capabilities! 🎯📈✨
