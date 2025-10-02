# Forex Prediction System

A comprehensive AI-powered forex prediction system with real-time data analysis, technical indicators, machine learning models, and intelligent trading signals.

## 🚀 Features

- **Real-time Data Analysis**: Live forex data processing with WebSocket connections
- **AI-Powered Predictions**: Machine learning models for market analysis
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages, and more
- **Trading Signals**: Intelligent BUY/SELL/HOLD recommendations
- **Interactive Dashboard**: Modern React-based UI with advanced charts
- **Backtesting**: Historical performance analysis
- **Multiple Currency Pairs**: Support for major forex pairs
- **News Integration**: Market news and sentiment analysis
- **Pattern Recognition**: AI-driven pattern detection
- **Risk Management**: Advanced risk assessment tools

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Ant Design UI components
- Chart.js & Recharts for data visualization
- Socket.io for real-time updates
- Zustand for state management

### Backend
- Node.js with Express
- PostgreSQL database
- Sequelize ORM
- WebSocket support
- Technical indicators library
- Cron jobs for scheduled tasks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd forex-prediction
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

4. **Initialize database:**
   ```bash
   cd backend
   node init-database.js
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
forex-prediction/
├── backend/                 # Backend API server
│   ├── config/             # Database configuration
│   ├── models/             # Database models
│   ├── services/           # Business logic services
│   └── intelligent-backend.js  # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── dist/               # Built frontend
└── package.json           # Root package configuration
```

## 🔧 API Endpoints

- `GET /api/signals/:pair` - Get trading signals for currency pair
- `GET /api/data/historical` - Get historical price data
- `GET /api/data/quote` - Get current market quotes
- `POST /api/backtest/run` - Run backtesting analysis
- `GET /api/news` - Get market news and sentiment
- `GET /api/indicators/:pair` - Get technical indicators
- `WebSocket /ws` - Real-time data updates

## 🌐 Deployment

### Vercel Deployment

1. **Connect to GitHub:**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Configure build settings:**
   - Build Command: `npm run build:frontend`
   - Output Directory: `frontend/dist`
   - Install Command: `npm run install:all`

3. **Set environment variables:**
   - Add your database credentials
   - Add API keys for data providers

4. **Deploy:**
   - Vercel will automatically deploy on every push

### Environment Variables

Create a `.env` file in the backend directory:

```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=forex_prediction
DB_USER=your-username
DB_PASSWORD=your-password
API_KEY=your-forex-api-key
NODE_ENV=production
PORT=3000
```

## 📊 Usage

1. **Dashboard**: View real-time market data and signals
2. **Analysis**: Access AI-powered market analysis
3. **Backtesting**: Test strategies with historical data
4. **Signals**: Get trading recommendations
5. **News**: Stay updated with market news

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is for educational and research purposes only. Trading forex involves substantial risk and may not be suitable for all investors. Past performance does not guarantee future results.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for the forex trading community**