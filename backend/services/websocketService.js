import WebSocket from 'ws';
import { ForexData } from '../models/index.js';

class WebSocketService {
  constructor() {
    this.connections = new Map();
    this.subscriptions = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
  }

  // Initialize WebSocket connections for different data sources
  async initializeConnections(apiKeys) {
    console.log('🔌 Initializing WebSocket connections...');
    
    // Initialize Finnhub WebSocket
    if (apiKeys.websocket_keys?.finnhub) {
      await this.connectFinnhub(apiKeys.websocket_keys.finnhub);
    }
    
    // Initialize other WebSocket connections as needed
    // Add more providers here
  }

  // Finnhub WebSocket connection
  async connectFinnhub(apiKey) {
    try {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
      
      ws.on('open', () => {
        console.log('✅ Finnhub WebSocket connected');
        this.connections.set('finnhub', ws);
        this.reconnectAttempts.set('finnhub', 0);
        
        // Subscribe to forex pairs
        this.subscribeToForexPairs(ws);
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleFinnhubMessage(message);
        } catch (error) {
          console.error('Error parsing Finnhub message:', error);
        }
      });

      ws.on('close', () => {
        console.log('❌ Finnhub WebSocket disconnected');
        this.handleReconnection('finnhub', apiKey);
      });

      ws.on('error', (error) => {
        console.error('Finnhub WebSocket error:', error);
        this.handleReconnection('finnhub', apiKey);
      });

    } catch (error) {
      console.error('Failed to connect to Finnhub WebSocket:', error);
    }
  }

  // Subscribe to forex pairs
  subscribeToForexPairs(ws) {
    const forexPairs = [
      'OANDA:EUR_USD',
      'OANDA:GBP_USD', 
      'OANDA:USD_JPY',
      'OANDA:AUD_USD',
      'OANDA:USD_CAD',
      'OANDA:USD_CHF',
      'OANDA:NZD_USD',
      'OANDA:EUR_GBP',
      'OANDA:EUR_JPY',
      'OANDA:GBP_JPY'
    ];

    forexPairs.forEach(symbol => {
      const subscribeMessage = {
        type: 'subscribe',
        symbol: symbol
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      console.log(`📡 Subscribed to ${symbol}`);
    });
  }

  // Handle incoming messages from Finnhub
  async handleFinnhubMessage(message) {
    if (message.type === 'trade') {
      const { s: symbol, p: price, t: timestamp, v: volume } = message.data[0];
      
      // Convert Finnhub symbol to our format
      const pair = this.convertFinnhubSymbol(symbol);
      
      if (pair) {
        await this.storeForexData(pair, {
          timestamp: new Date(timestamp),
          price: parseFloat(price),
          volume: volume || 0,
          source: 'finnhub_websocket'
        });
      }
    }
  }

  // Convert Finnhub symbol format to our format
  convertFinnhubSymbol(symbol) {
    const symbolMap = {
      'OANDA:EUR_USD': 'EUR/USD',
      'OANDA:GBP_USD': 'GBP/USD',
      'OANDA:USD_JPY': 'USD/JPY',
      'OANDA:AUD_USD': 'AUD/USD',
      'OANDA:USD_CAD': 'USD/CAD',
      'OANDA:USD_CHF': 'USD/CHF',
      'OANDA:NZD_USD': 'NZD/USD',
      'OANDA:EUR_GBP': 'EUR/GBP',
      'OANDA:EUR_JPY': 'EUR/JPY',
      'OANDA:GBP_JPY': 'GBP/JPY'
    };
    
    return symbolMap[symbol] || null;
  }

  // Store forex data in database
  async storeForexData(pair, data) {
    try {
      // For real-time data, we'll store it as 1-minute candles
      const timeframe = '1m';
      
      await ForexData.create({
        pair,
        timeframe,
        timestamp: data.timestamp,
        open: data.price,
        high: data.price,
        low: data.price,
        close: data.price,
        volume: data.volume,
        data_source: data.source
      });
      
      console.log(`💾 Stored ${pair} data: ${data.price} at ${data.timestamp}`);
    } catch (error) {
      console.error('Error storing forex data:', error);
    }
  }

  // Handle reconnection logic
  handleReconnection(provider, apiKey) {
    const attempts = this.reconnectAttempts.get(provider) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      console.log(`🔄 Attempting to reconnect ${provider} (attempt ${attempts + 1})`);
      
      setTimeout(() => {
        this.reconnectAttempts.set(provider, attempts + 1);
        
        if (provider === 'finnhub') {
          this.connectFinnhub(apiKey);
        }
      }, this.reconnectDelay);
    } else {
      console.error(`❌ Max reconnection attempts reached for ${provider}`);
    }
  }

  // Get real-time data for a specific pair
  async getRealTimeData(pair) {
    try {
      const latestData = await ForexData.findOne({
        where: { pair },
        order: [['timestamp', 'DESC']]
      });
      
      return latestData;
    } catch (error) {
      console.error('Error getting real-time data:', error);
      return null;
    }
  }

  // Get historical data from database
  async getHistoricalData(pair, timeframe = '1h', limit = 100) {
    try {
      const data = await ForexData.findAll({
        where: { 
          pair,
          timeframe 
        },
        order: [['timestamp', 'ASC']],
        limit
      });
      
      return data.map(item => ({
        timestamp: item.timestamp,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume)
      }));
    } catch (error) {
      console.error('Error getting historical data:', error);
      return [];
    }
  }

  // Close all connections
  closeAllConnections() {
    this.connections.forEach((ws, provider) => {
      console.log(`🔌 Closing ${provider} WebSocket connection`);
      ws.close();
    });
    this.connections.clear();
  }
}

export default WebSocketService;
