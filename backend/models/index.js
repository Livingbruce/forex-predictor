import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// User API Keys Model
export const UserApiKeys = sequelize.define('user_api_keys', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'default_user'
  },
  websocket_keys: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: () => ({
      finnhub: '',
      alpha_vantage: '',
      twelve_data: ''
    })
  },
  rest_api_keys: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: () => ({
      alpha_vantage: '',
      twelve_data: '',
      exchange_rates: ''
    })
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Forex Data Model (Live and Historical)
export const ForexData = sequelize.define('forex_data', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  timeframe: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    index: true
  },
  open: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  high: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  low: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  close: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  volume: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  data_source: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'websocket'
  }
});

// AI Analysis Results Model
export const AiAnalysis = sequelize.define('ai_analysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  analysis_type: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  signal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  technical_indicators: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  market_insights: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  risk_assessment: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  entry_strategy: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  reasoning: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timeframe_analysis: {
    type: DataTypes.JSONB,
    allowNull: false
  }
});

// Backtest Results Model
export const BacktestResults = sequelize.define('backtest_results', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  strategy_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  initial_capital: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  final_capital: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  total_return: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false
  },
  max_drawdown: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false
  },
  sharpe_ratio: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false
  },
  win_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  total_trades: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profitable_trades: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  backtest_data: {
    type: DataTypes.JSONB,
    allowNull: false
  }
});

// Trading Signals Model
export const TradingSignals = sequelize.define('trading_signals', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  signal_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  signal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  entry_price: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  stop_loss: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  take_profit: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  position_size: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});

// System Performance Metrics Model
export const SystemMetrics = sequelize.define('system_metrics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  metric_type: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  metric_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metric_value: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false
  },
  metric_unit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    index: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});

// Create indexes for better performance
export const createIndexes = async () => {
  try {
    // Forex data indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_forex_data_pair_timestamp 
      ON forex_data (pair, timestamp DESC);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_forex_data_timeframe_timestamp 
      ON forex_data (timeframe, timestamp DESC);
    `);
    
    // AI analysis indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_pair_type 
      ON ai_analysis (pair, analysis_type);
    `);
    
    // Trading signals indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trading_signals_pair_status 
      ON trading_signals (pair, status);
    `);
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

export default {
  UserApiKeys,
  ForexData,
  AiAnalysis,
  BacktestResults,
  TradingSignals,
  SystemMetrics,
  createIndexes
};
