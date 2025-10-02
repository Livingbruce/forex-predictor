import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'dev-key-change-in-production' // This should be configurable
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - only handle real responses
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error.response?.data || error)
  }
)

// Real API service functions - no mock data
export const fetchLiveData = async (pair) => {
  try {
    const response = await api.get(`/live/${encodeURIComponent(pair)}`)
    return response
  } catch (error) {
    console.error('Error fetching live data:', error)
    throw error
  }
}

export const fetchHistoricalData = async (pair, timeframe = '1h', limit = 100) => {
  try {
    const response = await api.get(`/data/historical`, {
      params: { pair, timeframe, limit }
    })
    return response
  } catch (error) {
    console.error('Error fetching historical data:', error)
    throw error
  }
}

export const fetchIntelligentSignals = async (pair) => {
  try {
    const response = await api.get(`/signals/${encodeURIComponent(pair)}`)
    return response
  } catch (error) {
    console.error('Error fetching intelligent signals:', error)
    throw error
  }
}

export const fetchTradingRecommendation = async (pair, timezone = 'UTC') => {
  try {
    const response = await api.get(`/trading-recommendation/${encodeURIComponent(pair)}`, {
      params: { timezone }
    })
    return response
  } catch (error) {
    console.error('Error fetching trading recommendation:', error)
    throw error
  }
}

// AI Market Analysis
export const fetchAIMarketAnalysis = async (pair, timeframe = '1h', limit = 100) => {
  try {
    const response = await api.get(`/ai-market-analysis/${encodeURIComponent(pair)}`, {
      params: { timeframe, limit }
    })
    return response
  } catch (error) {
    console.error('Error fetching AI market analysis:', error)
    throw error
  }
}

export const fetchTimingAnalysis = async (pair) => {
  try {
    const response = await api.get(`/timing/${encodeURIComponent(pair)}`)
    return response
  } catch (error) {
    console.error('Error fetching timing analysis:', error)
    throw error
  }
}

export const fetchSignalData = async (pair, timeframe = '1h') => {
  try {
    const encodedPair = encodeURIComponent(pair)
    const response = await api.get(`/signals/${encodedPair}`, {
      params: { timeframe, limit: 100 }
    })
    return response
  } catch (error) {
    console.error('fetchSignalData error:', error)
    throw error
  }
}

export const fetchSignalHistory = async (pair, timeframe = '1h', limit = 50) => {
  try {
    const response = await api.get(`/signals/${encodeURIComponent(pair)}/history`, {
      params: { timeframe, limit }
    })
    return response
  } catch (error) {
    console.error('Error fetching signal history:', error)
    throw error
  }
}

export const fetchCurrencyStrength = async (pair) => {
  try {
    const response = await api.get('/currency-strength', {
      params: { pair }
    })
    return response
  } catch (error) {
    console.error('Error fetching currency strength:', error)
    throw error
  }
}

export const fetchMLPatterns = async (pair) => {
  try {
    const response = await api.get('/ml/patterns', {
      params: { pair }
    })
    return response
  } catch (error) {
    console.error('Error fetching ML patterns:', error)
    throw error
  }
}

export const fetchMLFeedback = async (pair) => {
  try {
    const response = await api.get('/ml/feedback', {
      params: { pair }
    })
    return response
  } catch (error) {
    console.error('Error fetching ML feedback:', error)
    throw error
  }
}

export const submitMLFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/ml/feedback', feedbackData)
    return response
  } catch (error) {
    console.error('Error submitting ML feedback:', error)
    throw error
  }
}

export const fetchNews = async (pair, limit = 5) => {
  try {
    const response = await api.get(`/news/${encodeURIComponent(pair)}`, {
      params: { limit }
    })
    return response
  } catch (error) {
    console.error('Error fetching news:', error)
    throw error
  }
}

export const fetchSentiment = async (pair) => {
  try {
    const response = await api.get(`/sentiment/${encodeURIComponent(pair)}`)
    return response
  } catch (error) {
    console.error('Error fetching sentiment:', error)
    throw error
  }
}

export const runBacktest = async (backtestParams) => {
  try {
    const response = await api.post('/backtest/run', backtestParams)
    return response
  } catch (error) {
    console.error('Error running backtest:', error)
    throw error
  }
}

export const fetchBacktestHistory = async () => {
  try {
    const response = await api.get('/backtest/history')
    return response
  } catch (error) {
    console.error('Error fetching backtest history:', error)
    throw error
  }
}

export default api