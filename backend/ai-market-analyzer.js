import axios from 'axios'

class AIMarketAnalyzer {
  constructor() {
    this.indicators = {
      sma: this.calculateSMA,
      ema: this.calculateEMA,
      rsi: this.calculateRSI,
      macd: this.calculateMACD,
      bollinger: this.calculateBollingerBands,
      stochastic: this.calculateStochastic,
      williams: this.calculateWilliamsR,
      atr: this.calculateATR
    }
  }

  // Technical Analysis Indicators
  calculateSMA(data, period) {
    if (data.length < period) return []
    const sma = []
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0)
      sma.push(sum / period)
    }
    return sma
  }

  calculateEMA(data, period) {
    if (data.length < period) return []
    const ema = []
    const multiplier = 2 / (period + 1)
    
    // First EMA value is SMA
    const firstSMA = this.calculateSMA(data.slice(0, period), period)[0]
    ema.push(firstSMA)
    
    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i].close * multiplier) + (ema[ema.length - 1] * (1 - multiplier))
      ema.push(currentEMA)
    }
    return ema
  }

  calculateRSI(data, period = 14) {
    if (data.length < period + 1) return []
    const gains = []
    const losses = []
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }
    
    const rsi = []
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      
      if (avgLoss === 0) {
        rsi.push(100)
      } else {
        const rs = avgGain / avgLoss
        rsi.push(100 - (100 / (1 + rs)))
      }
    }
    return rsi
  }

  calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    console.log(`📊 Calculating MACD with ${data.length} data points`)
    
    const fastEMA = this.calculateEMA(data, fastPeriod)
    const slowEMA = this.calculateEMA(data, slowPeriod)
    
    console.log(`📊 Fast EMA (${fastPeriod}): ${fastEMA.length} values, last: ${fastEMA[fastEMA.length - 1]}`)
    console.log(`📊 Slow EMA (${slowPeriod}): ${slowEMA.length} values, last: ${slowEMA[slowEMA.length - 1]}`)
    
    if (fastEMA.length !== slowEMA.length) {
      console.log('⚠️ EMA length mismatch, returning empty arrays')
      return { macd: [], signal: [], histogram: [] }
    }
    
    const macd = []
    for (let i = 0; i < fastEMA.length; i++) {
      macd.push(fastEMA[i] - slowEMA[i])
    }
    
    console.log(`📊 MACD calculated: ${macd.length} values, last: ${macd[macd.length - 1]}`)
    
    // Convert MACD to data format for signal calculation
    const macdData = macd.map((value, index) => ({ close: value }))
    const signal = this.calculateEMA(macdData, signalPeriod)
    
    const histogram = []
    for (let i = 0; i < macd.length; i++) {
      histogram.push(macd[i] - (signal[i] || 0))
    }
    
    console.log(`📊 MACD Signal: ${signal.length} values, last: ${signal[signal.length - 1]}`)
    console.log(`📊 MACD Histogram: ${histogram.length} values, last: ${histogram[histogram.length - 1]}`)
    
    return { macd, signal, histogram }
  }

  calculateBollingerBands(data, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(data, period)
    const bands = { upper: [], middle: [], lower: [] }
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const mean = sma[i - period + 1]
      const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - mean, 2), 0) / period
      const standardDeviation = Math.sqrt(variance)
      
      bands.upper.push(mean + (stdDev * standardDeviation))
      bands.middle.push(mean)
      bands.lower.push(mean - (stdDev * standardDeviation))
    }
    
    return bands
  }

  calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
    const stoch = { k: [], d: [] }
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1)
      const highest = Math.max(...slice.map(candle => candle.high))
      const lowest = Math.min(...slice.map(candle => candle.low))
      const currentClose = data[i].close
      
      const k = ((currentClose - lowest) / (highest - lowest)) * 100
      stoch.k.push(k)
    }
    
    // Calculate %D (SMA of %K)
    for (let i = dPeriod - 1; i < stoch.k.length; i++) {
      const d = stoch.k.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / dPeriod
      stoch.d.push(d)
    }
    
    return stoch
  }

  calculateWilliamsR(data, period = 14) {
    const williamsR = []
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const highest = Math.max(...slice.map(candle => candle.high))
      const lowest = Math.min(...slice.map(candle => candle.low))
      const currentClose = data[i].close
      
      const wr = ((highest - currentClose) / (highest - lowest)) * -100
      williamsR.push(wr)
    }
    
    return williamsR
  }

  calculateATR(data, period = 14) {
    const trueRanges = []
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high
      const low = data[i].low
      const prevClose = data[i - 1].close
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      )
      trueRanges.push(tr)
    }
    
    const atr = []
    for (let i = period - 1; i < trueRanges.length; i++) {
      const avgTR = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      atr.push(avgTR)
    }
    
    return atr
  }

  // Pattern Recognition
  detectPatterns(data) {
    const patterns = {
      trend: this.detectTrend(data),
      supportResistance: this.detectSupportResistance(data),
      chartPatterns: this.detectChartPatterns(data),
      candlestickPatterns: this.detectCandlestickPatterns(data)
    }
    return patterns
  }

  detectTrend(data) {
    if (data.length < 20) return 'sideways'
    
    const recent = data.slice(-20)
    const firstPrice = recent[0].close
    const lastPrice = recent[recent.length - 1].close
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100
    
    if (changePercent > 2) return 'uptrend'
    if (changePercent < -2) return 'downtrend'
    return 'sideways'
  }

  detectSupportResistance(data) {
    if (data.length < 50) return { support: [], resistance: [] }
    
    const prices = data.map(d => d.close)
    const highs = data.map(d => d.high)
    const lows = data.map(d => d.low)
    
    // Find local maxima and minima
    const resistance = []
    const support = []
    
    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
          highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
        resistance.push(highs[i])
      }
      
      if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
          lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
        support.push(lows[i])
      }
    }
    
    return { support, resistance }
  }

  detectChartPatterns(data) {
    const patterns = []
    
    // Head and Shoulders
    if (this.detectHeadAndShoulders(data)) {
      patterns.push({ name: 'Head and Shoulders', type: 'reversal', bullish: false })
    }
    
    // Double Top/Bottom
    if (this.detectDoubleTop(data)) {
      patterns.push({ name: 'Double Top', type: 'reversal', bullish: false })
    }
    if (this.detectDoubleBottom(data)) {
      patterns.push({ name: 'Double Bottom', type: 'reversal', bullish: true })
    }
    
    // Triangle patterns
    const triangle = this.detectTriangle(data)
    if (triangle) {
      patterns.push(triangle)
    }
    
    return patterns
  }

  detectHeadAndShoulders(data) {
    if (data.length < 30) return false
    
    const recent = data.slice(-30)
    const highs = recent.map(d => d.high)
    
    // Find three peaks
    const peaks = []
    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
          highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
        peaks.push({ index: i, value: highs[i] })
      }
    }
    
    if (peaks.length < 3) return false
    
    // Check if middle peak is highest (head)
    const head = peaks[Math.floor(peaks.length / 2)]
    const shoulders = peaks.filter(p => p !== head)
    
    return shoulders.every(s => s.value < head.value * 0.95)
  }

  detectDoubleTop(data) {
    if (data.length < 20) return false
    
    const recent = data.slice(-20)
    const highs = recent.map(d => d.high)
    const maxHigh = Math.max(...highs)
    
    // Find two peaks near the maximum
    const peaks = []
    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
          highs[i] > highs[i+1] && highs[i] > highs[i+2] &&
          highs[i] >= maxHigh * 0.95) {
        peaks.push(i)
      }
    }
    
    return peaks.length >= 2
  }

  detectDoubleBottom(data) {
    if (data.length < 20) return false
    
    const recent = data.slice(-20)
    const lows = recent.map(d => d.low)
    const minLow = Math.min(...lows)
    
    // Find two troughs near the minimum
    const troughs = []
    for (let i = 2; i < lows.length - 2; i++) {
      if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
          lows[i] < lows[i+1] && lows[i] < lows[i+2] &&
          lows[i] <= minLow * 1.05) {
        troughs.push(i)
      }
    }
    
    return troughs.length >= 2
  }

  detectTriangle(data) {
    if (data.length < 20) return null
    
    const recent = data.slice(-20)
    const highs = recent.map(d => d.high)
    const lows = recent.map(d => d.low)
    
    // Check for ascending triangle (horizontal resistance, rising support)
    const resistanceLevel = Math.max(...highs.slice(0, 10))
    const supportTrend = this.calculateTrendSlope(lows.slice(10))
    
    if (supportTrend > 0 && Math.abs(supportTrend) < 0.001) {
      return { name: 'Ascending Triangle', type: 'continuation', bullish: true }
    }
    
    // Check for descending triangle (horizontal support, falling resistance)
    const supportLevel = Math.min(...lows.slice(0, 10))
    const resistanceTrend = this.calculateTrendSlope(highs.slice(10))
    
    if (resistanceTrend < 0 && Math.abs(resistanceTrend) < 0.001) {
      return { name: 'Descending Triangle', type: 'continuation', bullish: false }
    }
    
    return null
  }

  calculateTrendSlope(values) {
    if (values.length < 2) return 0
    
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + (x * y), 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }

  detectCandlestickPatterns(data) {
    if (data.length < 3) return []
    
    const patterns = []
    const recent = data.slice(-5)
    
    // Doji
    for (let i = 0; i < recent.length; i++) {
      const candle = recent[i]
      const bodySize = Math.abs(candle.close - candle.open)
      const totalRange = candle.high - candle.low
      
      if (bodySize < totalRange * 0.1) {
        patterns.push({ name: 'Doji', type: 'indecision', index: i })
      }
    }
    
    // Hammer/Hanging Man
    for (let i = 0; i < recent.length; i++) {
      const candle = recent[i]
      const bodySize = Math.abs(candle.close - candle.open)
      const lowerWick = Math.min(candle.open, candle.close) - candle.low
      const upperWick = candle.high - Math.max(candle.open, candle.close)
      
      if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
        patterns.push({ 
          name: candle.close > candle.open ? 'Hammer' : 'Hanging Man', 
          type: 'reversal', 
          bullish: candle.close > candle.open,
          index: i 
        })
      }
    }
    
    return patterns
  }

  // Definitive Trading Advisor - Stable BUY/SELL/HOLD Signals
  generateTradingRecommendation(historicalData, liveData) {
    console.log('🎯 Generating definitive trading recommendation...')
    
    // Core indicators for stable signals
    const ema50 = this.calculateEMA(historicalData, 50)
    const ema200 = this.calculateEMA(historicalData, 200)
    const rsi = this.calculateRSI(historicalData, 14)
    const macd = this.calculateMACD(historicalData, 12, 26, 9)
    
    // Get current values with null checks
    const currentPrice = typeof liveData.close === 'number' ? liveData.close : 0
    const currentEMA50 = ema50 && ema50.length > 0 ? ema50[ema50.length - 1] : 0
    const currentEMA200 = ema200 && ema200.length > 0 ? ema200[ema200.length - 1] : 0
    const currentRSI = rsi && rsi.length > 0 ? rsi[rsi.length - 1] : 50
    const currentMACD = macd && macd.macd && macd.macd.length > 0 ? macd.macd[macd.macd.length - 1] : 0
    const currentMACDSignal = macd && macd.signal && macd.signal.length > 0 ? macd.signal[macd.signal.length - 1] : 0
    const currentMACDHistogram = macd && macd.histogram && macd.histogram.length > 0 ? macd.histogram[macd.histogram.length - 1] : 0
    
    // Signal confirmation system
    const signalConfirmation = this.getSignalConfirmation(historicalData, {
      ema50: currentEMA50,
      ema200: currentEMA200,
      rsi: currentRSI,
      macd: currentMACD,
      macdSignal: currentMACDSignal,
      macdHistogram: currentMACDHistogram,
      price: currentPrice
    })
    
    // Generate definitive recommendation
    const recommendation = this.generateDefinitiveRecommendation(signalConfirmation, {
      ema50: currentEMA50,
      ema200: currentEMA200,
      rsi: currentRSI,
      macd: currentMACD,
      macdSignal: currentMACDSignal,
      macdHistogram: currentMACDHistogram,
      price: currentPrice
    })
    
    console.log(`🎯 Trading Recommendation: ${recommendation.signal} (${recommendation.confidence}% confidence)`)
    
    return recommendation
  }

  getSignalConfirmation(data, indicators) {
    const { ema50, ema200, rsi, macd, macdSignal, macdHistogram, price } = indicators
    
    // Calculate confirmation scores
    let bullishScore = 0
    let bearishScore = 0
    let confirmationReasons = []
    
    // 1. EMA Crossover Analysis (Primary Signal)
    if (ema50 > ema200) {
      bullishScore += 3 // Strong bullish signal
      confirmationReasons.push('EMA50 above EMA200 - Bullish trend')
    } else if (ema50 < ema200) {
      bearishScore += 3 // Strong bearish signal
      confirmationReasons.push('EMA50 below EMA200 - Bearish trend')
    }
    
    // 2. Price vs EMA Analysis
    if (price > ema50) {
      bullishScore += 1
      confirmationReasons.push('Price above EMA50 - Short-term bullish')
    } else if (price < ema50) {
      bearishScore += 1
      confirmationReasons.push('Price below EMA50 - Short-term bearish')
    }
    
    // 3. RSI Analysis
    if (rsi && rsi > 50 && rsi < 70) {
      bullishScore += 1
      confirmationReasons.push(`RSI at ${(rsi || 50).toFixed(1)} - Bullish momentum`)
    } else if (rsi && rsi < 50 && rsi > 30) {
      bearishScore += 1
      confirmationReasons.push(`RSI at ${(rsi || 50).toFixed(1)} - Bearish momentum`)
    } else if (rsi && rsi > 70) {
      bearishScore += 0.5 // Overbought warning
      confirmationReasons.push(`RSI at ${(rsi || 50).toFixed(1)} - Overbought warning`)
    } else if (rsi && rsi < 30) {
      bullishScore += 0.5 // Oversold opportunity
      confirmationReasons.push(`RSI at ${(rsi || 50).toFixed(1)} - Oversold opportunity`)
    }
    
    // 4. MACD Analysis
    if (macd && macdSignal && macdHistogram && macd > macdSignal && macdHistogram > 0) {
      bullishScore += 2
      confirmationReasons.push('MACD above signal line with positive histogram - Bullish momentum')
    } else if (macd && macdSignal && macdHistogram && macd < macdSignal && macdHistogram < 0) {
      bearishScore += 2
      confirmationReasons.push('MACD below signal line with negative histogram - Bearish momentum')
    }
    
    // 5. Trend Strength Analysis
    const trendStrength = ema200 && ema200 > 0 ? Math.abs(ema50 - ema200) / ema200 * 100 : 0
    if (trendStrength > 1) { // Strong trend
      if (ema50 > ema200) {
        bullishScore += 1
        confirmationReasons.push(`Strong bullish trend (${(trendStrength || 0).toFixed(2)}% separation)`)
      } else {
        bearishScore += 1
        confirmationReasons.push(`Strong bearish trend (${(trendStrength || 0).toFixed(2)}% separation)`)
      }
    }
    
    return {
      bullishScore,
      bearishScore,
      reasons: confirmationReasons,
      trendStrength: (trendStrength || 0).toFixed(2)
    }
  }

  generateDefinitiveRecommendation(confirmation, indicators) {
    const { bullishScore, bearishScore, reasons, trendStrength } = confirmation
    const { ema50, ema200, rsi, macd, macdSignal, macdHistogram, price } = indicators
    
    let signal = 'HOLD'
    let confidence = 50
    let recommendation = ''
    let entryStrategy = {}
    let riskManagement = {}
    
    // Determine signal based on confirmation scores
    const scoreDifference = Math.abs(bullishScore - bearishScore)
    const minScoreThreshold = 3 // Minimum score for definitive signal
    
    if (bullishScore >= minScoreThreshold && bullishScore > bearishScore) {
      signal = 'BUY'
      confidence = Math.min(95, 60 + (bullishScore * 8) + (scoreDifference * 5))
      
      recommendation = `STRONG BUY SIGNAL - ${reasons.slice(0, 3).join(', ')}`
      
      // Entry strategy for BUY
      entryStrategy = {
        type: 'BUY',
        entryPrice: price || 0,
        stopLoss: (price || 0) * 0.98, // 2% stop loss
        takeProfit1: (price || 0) * 1.03, // 3% take profit (1.5:1 ratio)
        takeProfit2: (price || 0) * 1.04, // 4% take profit (2:1 ratio)
        positionSize: this.calculatePositionSize(confidence, 'STRONG')
      }
      
    } else if (bearishScore >= minScoreThreshold && bearishScore > bullishScore) {
      signal = 'SELL'
      confidence = Math.min(95, 60 + (bearishScore * 8) + (scoreDifference * 5))
      
      recommendation = `STRONG SELL SIGNAL - ${reasons.slice(0, 3).join(', ')}`
      
      // Entry strategy for SELL
      entryStrategy = {
        type: 'SELL',
        entryPrice: price || 0,
        stopLoss: (price || 0) * 1.02, // 2% stop loss
        takeProfit1: (price || 0) * 0.97, // 3% take profit (1.5:1 ratio)
        takeProfit2: (price || 0) * 0.96, // 4% take profit (2:1 ratio)
        positionSize: this.calculatePositionSize(confidence, 'STRONG')
      }
      
    } else {
      signal = 'HOLD'
      confidence = 30
      recommendation = 'WAIT FOR BETTER ENTRY - Mixed signals, insufficient confirmation for directional trade'
      
      // Hold strategy
      entryStrategy = {
        type: 'HOLD',
        entryPrice: price,
        stopLoss: null,
        takeProfit1: null,
        takeProfit2: null,
        positionSize: '0'
      }
    }
    
    // Risk management
    riskManagement = {
      maxRisk: '2%',
      stopLossDistance: entryStrategy.stopLoss ? Math.abs(entryStrategy.stopLoss - price) / price * 100 : 0,
      riskRewardRatio: entryStrategy.takeProfit1 ? 
        Math.abs(entryStrategy.takeProfit1 - price) / Math.abs(entryStrategy.stopLoss - price) : 0,
      positionSize: entryStrategy.positionSize,
      maxDrawdown: '5%',
      trendStrength: `${trendStrength}%`
    }
    
    return {
      signal,
      confidence: Math.round(confidence),
      recommendation,
      reasons: reasons.slice(0, 5), // Top 5 reasons
      entryStrategy,
      riskManagement,
      indicators: {
        ema50: (ema50 || 0).toFixed(4),
        ema200: (ema200 || 0).toFixed(4),
        rsi: (rsi || 50).toFixed(1),
        macd: (macd || 0).toFixed(6),
        macdSignal: (macdSignal || 0).toFixed(6),
        macdHistogram: (macdHistogram || 0).toFixed(6),
        price: (price || 0).toFixed(4)
      },
      timestamp: new Date().toISOString()
    }
  }

  calculatePositionSize(confidence, trendStrength) {
    const baseSize = 1.0
    const confidenceMultiplier = (confidence || 50) / 100
    const strengthMultiplier = trendStrength === 'STRONG' ? 1.2 : 1.0
    
    return (baseSize * confidenceMultiplier * strengthMultiplier).toFixed(2)
  }

  // Long-term Market Trend Analysis for Definitive Trading Signals
  analyzeLongTermTrend(historicalData, liveData) {
    console.log('🎯 Analyzing long-term market trend for definitive trading signals...')
    
    // Multi-timeframe analysis
    const shortTerm = this.analyzeTimeframe(historicalData.slice(-20), 'short') // Last 20 periods
    const mediumTerm = this.analyzeTimeframe(historicalData.slice(-50), 'medium') // Last 50 periods  
    const longTerm = this.analyzeTimeframe(historicalData, 'long') // All data
    
    // Calculate trend strength
    const trendStrength = this.calculateTrendStrength(historicalData)
    
    // Market structure analysis
    const marketStructure = this.analyzeMarketStructure(historicalData)
    
    // Volume analysis
    const volumeAnalysis = this.analyzeVolume(historicalData)
    
    // Support and resistance levels
    const supportResistance = this.identifySupportResistance(historicalData)
    
    // Generate definitive signal
    const definitiveSignal = this.generateDefinitiveSignal({
      shortTerm,
      mediumTerm, 
      longTerm,
      trendStrength,
      marketStructure,
      volumeAnalysis,
      supportResistance,
      currentPrice: liveData.close
    })
    
    return {
      signal: definitiveSignal.signal,
      confidence: definitiveSignal.confidence,
      reasoning: definitiveSignal.reasoning,
      timeframes: definitiveSignal.timeframes,
      entryStrategy: definitiveSignal.entryStrategy,
      riskManagement: definitiveSignal.riskManagement,
      trendStrength,
      marketStructure,
      supportResistance
    }
  }

  analyzeTimeframe(data, timeframe) {
    const sma20 = this.calculateSMA(data, 20)
    const sma50 = this.calculateSMA(data, 50)
    const ema12 = this.calculateEMA(data, 12)
    const ema26 = this.calculateEMA(data, 26)
    const rsi = this.calculateRSI(data)
    const macd = this.calculateMACD(data)
    
    const currentPrice = data[data.length - 1].close
    const sma20Current = sma20 && sma20.length > 0 ? sma20[sma20.length - 1] : 0
    const sma50Current = sma50 && sma50.length > 0 ? sma50[sma50.length - 1] : 0
    const ema12Current = ema12 && ema12.length > 0 ? ema12[ema12.length - 1] : 0
    const ema26Current = ema26 && ema26.length > 0 ? ema26[ema26.length - 1] : 0
    const rsiCurrent = rsi && rsi.length > 0 ? rsi[rsi.length - 1] : 50
    const macdCurrent = macd && macd.macd && macd.macd.length > 0 ? macd.macd[macd.macd.length - 1] : 0
    const macdHistogram = macd && macd.histogram && macd.histogram.length > 0 ? macd.histogram[macd.histogram.length - 1] : 0
    
    // Trend analysis
    let trendScore = 0
    let trendDirection = 'NEUTRAL'
    
    // Price vs Moving Averages
    if (currentPrice > sma20Current) trendScore += 1
    if (currentPrice > sma50Current) trendScore += 1
    if (sma20Current > sma50Current) trendScore += 1
    if (ema12Current > ema26Current) trendScore += 1
    
    // RSI Analysis
    if (rsiCurrent > 50) trendScore += 0.5
    if (rsiCurrent > 60) trendScore += 0.5
    if (rsiCurrent < 40) trendScore -= 0.5
    if (rsiCurrent < 30) trendScore -= 0.5
    
    // MACD Analysis
    if (macdCurrent > 0) trendScore += 1
    if (macdHistogram > 0) trendScore += 0.5
    
    // Determine trend direction
    if (trendScore >= 3) trendDirection = 'BULLISH'
    else if (trendScore <= -1) trendDirection = 'BEARISH'
    
    return {
      timeframe,
      trendDirection,
      trendScore,
      currentPrice,
      sma20: sma20Current,
      sma50: sma50Current,
      ema12: ema12Current,
      ema26: ema26Current,
      rsi: rsiCurrent,
      macd: macdCurrent,
      macdHistogram
    }
  }

  calculateTrendStrength(data) {
    const sma20 = this.calculateSMA(data, 20)
    const sma50 = this.calculateSMA(data, 50)
    const currentPrice = data[data.length - 1].close
    
    // Calculate price momentum
    const priceChange = (currentPrice - data[data.length - 20].close) / data[data.length - 20].close * 100
    
    // Calculate moving average separation
    const maSeparation = Math.abs(sma20[sma20.length - 1] - sma50[sma50.length - 1]) / sma50[sma50.length - 1] * 100
    
    // Calculate volatility
    const volatility = this.calculateVolatility(data.slice(-20).map(candle => candle.close))
    
    let strength = 'WEAK'
    if (Math.abs(priceChange) > 2 && maSeparation > 1) strength = 'STRONG'
    else if (Math.abs(priceChange) > 1 && maSeparation > 0.5) strength = 'MODERATE'
    
    return {
      strength,
      priceChange: priceChange.toFixed(2),
      maSeparation: maSeparation.toFixed(2),
      volatility: volatility.toFixed(4)
    }
  }

  analyzeMarketStructure(data) {
    const highs = []
    const lows = []
    
    // Find significant highs and lows
    for (let i = 2; i < data.length - 2; i++) {
      const current = data[i]
      const prev2 = data[i - 2]
      const next2 = data[i + 2]
      
      // Higher high
      if (current.high > prev2.high && current.high > next2.high) {
        highs.push({ index: i, price: current.high, time: current.time })
      }
      
      // Lower low
      if (current.low < prev2.low && current.low < next2.low) {
        lows.push({ index: i, price: current.low, time: current.time })
      }
    }
    
    // Analyze structure
    let structure = 'RANGING'
    if (highs.length >= 2 && lows.length >= 2) {
      const recentHighs = highs.slice(-3)
      const recentLows = lows.slice(-3)
      
      // Higher highs and higher lows = Uptrend
      if (recentHighs.length >= 2 && recentLows.length >= 2) {
        const hh = recentHighs[recentHighs.length - 1].price > recentHighs[recentHighs.length - 2].price
        const hl = recentLows[recentLows.length - 1].price > recentLows[recentLows.length - 2].price
        if (hh && hl) structure = 'UPTREND'
      }
      
      // Lower highs and lower lows = Downtrend
      if (recentHighs.length >= 2 && recentLows.length >= 2) {
        const lh = recentHighs[recentHighs.length - 1].price < recentHighs[recentHighs.length - 2].price
        const ll = recentLows[recentLows.length - 1].price < recentLows[recentLows.length - 2].price
        if (lh && ll) structure = 'DOWNTREND'
      }
    }
    
    return {
      structure,
      highs: highs.slice(-5), // Last 5 highs
      lows: lows.slice(-5)    // Last 5 lows
    }
  }

  analyzeVolume(data) {
    // Simplified volume analysis (assuming volume data is available)
    const recentVolume = data.slice(-10)
    const avgVolume = recentVolume.reduce((sum, candle) => sum + (candle.volume || 1), 0) / recentVolume.length
    const currentVolume = data[data.length - 1].volume || 1
    
    let volumeSignal = 'NEUTRAL'
    if (currentVolume > avgVolume * 1.5) volumeSignal = 'HIGH'
    else if (currentVolume < avgVolume * 0.5) volumeSignal = 'LOW'
    
    return {
      signal: volumeSignal,
      current: currentVolume,
      average: avgVolume,
      ratio: (currentVolume / avgVolume).toFixed(2)
    }
  }

  identifySupportResistance(data) {
    const prices = data.map(candle => [candle.high, candle.low]).flat().sort((a, b) => a - b)
    
    // Find price clusters (potential support/resistance)
    const clusters = []
    const clusterSize = (Math.max(...prices) - Math.min(...prices)) * 0.01 // 1% of range
    
    for (let i = 0; i < prices.length - 5; i++) {
      const cluster = prices.slice(i, i + 5)
      const avg = cluster.reduce((sum, price) => sum + price, 0) / cluster.length
      const variance = cluster.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / cluster.length
      
      if (variance < clusterSize) {
        clusters.push({
          price: avg,
          strength: cluster.length,
          type: avg > data[data.length - 1].close ? 'RESISTANCE' : 'SUPPORT'
        })
      }
    }
    
    // Get strongest clusters
    const strongestClusters = clusters
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
    
    return {
      support: strongestClusters.filter(c => c.type === 'SUPPORT'),
      resistance: strongestClusters.filter(c => c.type === 'RESISTANCE')
    }
  }

  generateDefinitiveSignal(analysis) {
    console.log('🎯 Generating definitive trading signal...')
    
    const { shortTerm, mediumTerm, longTerm, trendStrength, marketStructure, volumeAnalysis, supportResistance, currentPrice } = analysis
    
    let signal = 'HOLD'
    let confidence = 50
    let reasoning = []
    let timeframes = {}
    let entryStrategy = {}
    let riskManagement = {}
    
    // Multi-timeframe consensus
    const bullishCount = [shortTerm, mediumTerm, longTerm].filter(t => t.trendDirection === 'BULLISH').length
    const bearishCount = [shortTerm, mediumTerm, longTerm].filter(t => t.trendDirection === 'BEARISH').length
    
    // Generate signals for different timeframes
    timeframes = {
      '5min': this.generateTimeframeSignal(shortTerm, '5min'),
      '30min': this.generateTimeframeSignal(mediumTerm, '30min'),
      '1hr': this.generateTimeframeSignal(mediumTerm, '1hr'),
      '4hr': this.generateTimeframeSignal(longTerm, '4hr'),
      'daily': this.generateTimeframeSignal(longTerm, 'daily')
    }
    
    // Determine overall signal based on consensus
    if (bullishCount >= 2 && trendStrength.strength !== 'WEAK') {
      signal = 'BUY'
      confidence = Math.min(95, 60 + (bullishCount * 10) + (trendStrength.strength === 'STRONG' ? 15 : 0))
      
      reasoning.push(`Multi-timeframe bullish consensus (${bullishCount}/3 timeframes)`)
      reasoning.push(`Market structure: ${marketStructure.structure}`)
      reasoning.push(`Trend strength: ${trendStrength.strength}`)
      reasoning.push(`Volume: ${volumeAnalysis.signal}`)
      
      // Entry strategy for BUY
      entryStrategy = {
        type: 'BUY',
        entryPrice: currentPrice,
        stopLoss: this.calculateStopLoss(currentPrice, 'BUY', supportResistance),
        takeProfit1: this.calculateTakeProfit(currentPrice, 'BUY', 1, supportResistance),
        takeProfit2: this.calculateTakeProfit(currentPrice, 'BUY', 2, supportResistance),
        positionSize: this.calculatePositionSize(confidence, trendStrength.strength)
      }
      
    } else if (bearishCount >= 2 && trendStrength.strength !== 'WEAK') {
      signal = 'SELL'
      confidence = Math.min(95, 60 + (bearishCount * 10) + (trendStrength.strength === 'STRONG' ? 15 : 0))
      
      reasoning.push(`Multi-timeframe bearish consensus (${bearishCount}/3 timeframes)`)
      reasoning.push(`Market structure: ${marketStructure.structure}`)
      reasoning.push(`Trend strength: ${trendStrength.strength}`)
      reasoning.push(`Volume: ${volumeAnalysis.signal}`)
      
      // Entry strategy for SELL
      entryStrategy = {
        type: 'SELL',
        entryPrice: currentPrice,
        stopLoss: this.calculateStopLoss(currentPrice, 'SELL', supportResistance),
        takeProfit1: this.calculateTakeProfit(currentPrice, 'SELL', 1, supportResistance),
        takeProfit2: this.calculateTakeProfit(currentPrice, 'SELL', 2, supportResistance),
        positionSize: this.calculatePositionSize(confidence, trendStrength.strength)
      }
    } else {
      signal = 'HOLD'
      confidence = 30
      reasoning.push('Mixed signals across timeframes')
      reasoning.push('Insufficient consensus for directional trade')
      reasoning.push('Wait for clearer market structure')
    }
    
    // Risk management
    riskManagement = {
      maxRisk: '2%',
      stopLossDistance: entryStrategy.stopLoss ? Math.abs(entryStrategy.stopLoss - currentPrice) / currentPrice * 100 : 0,
      riskRewardRatio: entryStrategy.takeProfit1 ? 
        Math.abs(entryStrategy.takeProfit1 - currentPrice) / Math.abs(entryStrategy.stopLoss - currentPrice) : 0,
      positionSize: entryStrategy.positionSize || '0.5',
      maxDrawdown: '5%'
    }
    
    console.log(`🎯 Definitive Signal: ${signal} (${confidence}% confidence)`)
    
    return {
      signal,
      confidence,
      reasoning,
      timeframes,
      entryStrategy,
      riskManagement
    }
  }

  generateTimeframeSignal(timeframeAnalysis, timeframe) {
    const { trendDirection, trendScore, rsi, macd, macdHistogram } = timeframeAnalysis
    
    let signal = 'HOLD'
    let confidence = 50
    
    if (trendDirection === 'BULLISH' && trendScore >= 3) {
      signal = 'BUY'
      confidence = Math.min(90, 50 + (trendScore * 10))
    } else if (trendDirection === 'BEARISH' && trendScore <= -1) {
      signal = 'SELL'
      confidence = Math.min(90, 50 + (Math.abs(trendScore) * 10))
    }
    
    return {
      timeframe,
      signal,
      confidence,
      trendScore,
      rsi: (rsi || 50).toFixed(2),
      macd: (macd || 0).toFixed(6),
      macdHistogram: (macdHistogram || 0).toFixed(6)
    }
  }

  calculateStopLoss(currentPrice, signal, supportResistance) {
    if (signal === 'BUY') {
      // Find nearest support level
      const supports = supportResistance.support
      if (supports.length > 0) {
        const nearestSupport = supports.reduce((prev, curr) => 
          Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev
        )
        return nearestSupport.price * 0.999 // Slightly below support
      }
      return currentPrice * 0.98 // 2% stop loss
    } else {
      // Find nearest resistance level
      const resistances = supportResistance.resistance
      if (resistances.length > 0) {
        const nearestResistance = resistances.reduce((prev, curr) => 
          Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev
        )
        return nearestResistance.price * 1.001 // Slightly above resistance
      }
      return currentPrice * 1.02 // 2% stop loss
    }
  }

  calculateTakeProfit(currentPrice, signal, level, supportResistance) {
    const multiplier = level === 1 ? 1.5 : 2.0 // 1.5:1 or 2:1 risk reward
    
    if (signal === 'BUY') {
      const stopLoss = this.calculateStopLoss(currentPrice, signal, supportResistance)
      const risk = currentPrice - stopLoss
      return currentPrice + (risk * multiplier)
    } else {
      const stopLoss = this.calculateStopLoss(currentPrice, signal, supportResistance)
      const risk = stopLoss - currentPrice
      return currentPrice - (risk * multiplier)
    }
  }

  calculatePositionSize(confidence, trendStrength) {
    const baseSize = 1.0 // Base position size
    const confidenceMultiplier = (confidence || 50) / 100
    const strengthMultiplier = trendStrength === 'STRONG' ? 1.2 : trendStrength === 'MODERATE' ? 1.0 : 0.8
    
    return (baseSize * confidenceMultiplier * strengthMultiplier).toFixed(2)
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0
    
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1])
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
    
    return Math.sqrt(variance)
  }

  // Predictive Analysis
  generatePrediction(data, liveData) {
    const technicalAnalysis = this.performTechnicalAnalysis(data)
    const patternAnalysis = this.detectPatterns(data)
    const sentimentAnalysis = this.analyzeSentiment(liveData)
    const volatilityAnalysis = this.analyzeVolatility(data)
    
    // Combine all analyses
    const prediction = this.combineAnalyses({
      technical: technicalAnalysis,
      patterns: patternAnalysis,
      sentiment: sentimentAnalysis,
      volatility: volatilityAnalysis
    })
    
    return prediction
  }

  performTechnicalAnalysis(data) {
    if (data.length < 50) return { score: 0, signals: [] }
    
    const signals = []
    let score = 0
    
    // RSI Analysis
    const rsi = this.calculateRSI(data)
    if (rsi.length > 0) {
      const currentRSI = rsi[rsi.length - 1]
      if (currentRSI < 30) {
        signals.push({ indicator: 'RSI', signal: 'BUY', strength: 'strong', value: currentRSI })
        score += 2
      } else if (currentRSI > 70) {
        signals.push({ indicator: 'RSI', signal: 'SELL', strength: 'strong', value: currentRSI })
        score -= 2
      } else if (currentRSI < 40) {
        signals.push({ indicator: 'RSI', signal: 'BUY', strength: 'weak', value: currentRSI })
        score += 1
      } else if (currentRSI > 60) {
        signals.push({ indicator: 'RSI', signal: 'SELL', strength: 'weak', value: currentRSI })
        score -= 1
      }
    }
    
    // MACD Analysis
    const macd = this.calculateMACD(data)
    if (macd.macd.length > 1 && macd.signal.length > 1) {
      const macdValue = macd.macd[macd.macd.length - 1]
      const signalValue = macd.signal[macd.signal.length - 1]
      const histogram = macd.histogram[macd.histogram.length - 1]
      
      if (macdValue > signalValue && histogram > 0) {
        signals.push({ indicator: 'MACD', signal: 'BUY', strength: 'medium', value: histogram })
        score += 1.5
      } else if (macdValue < signalValue && histogram < 0) {
        signals.push({ indicator: 'MACD', signal: 'SELL', strength: 'medium', value: histogram })
        score -= 1.5
      }
    }
    
    // Moving Average Analysis
    const sma20 = this.calculateSMA(data, 20)
    const sma50 = this.calculateSMA(data, 50)
    
    if (sma20.length > 0 && sma50.length > 0) {
      const currentPrice = data[data.length - 1].close
      const sma20Value = sma20[sma20.length - 1]
      const sma50Value = sma50[sma50.length - 1]
      
      if (currentPrice > sma20Value && sma20Value > sma50Value) {
        signals.push({ indicator: 'MA', signal: 'BUY', strength: 'medium', value: currentPrice })
        score += 1
      } else if (currentPrice < sma20Value && sma20Value < sma50Value) {
        signals.push({ indicator: 'MA', signal: 'SELL', strength: 'medium', value: currentPrice })
        score -= 1
      }
    }
    
    // Bollinger Bands Analysis
    const bb = this.calculateBollingerBands(data)
    if (bb.upper.length > 0) {
      const currentPrice = data[data.length - 1].close
      const upperBand = bb.upper[bb.upper.length - 1]
      const lowerBand = bb.lower[bb.lower.length - 1]
      const middleBand = bb.middle[bb.middle.length - 1]
      
      if (currentPrice <= lowerBand) {
        signals.push({ indicator: 'BB', signal: 'BUY', strength: 'strong', value: currentPrice })
        score += 2
      } else if (currentPrice >= upperBand) {
        signals.push({ indicator: 'BB', signal: 'SELL', strength: 'strong', value: currentPrice })
        score -= 2
      }
    }
    
    return { score, signals }
  }

  analyzeSentiment(liveData) {
    // Analyze price momentum and volume
    const priceChange = liveData.changePercent || 0
    const volume = liveData.volume || 0
    
    let sentiment = 'neutral'
    let strength = 0
    
    if (priceChange > 0.5) {
      sentiment = 'bullish'
      strength = Math.min(priceChange / 2, 3)
    } else if (priceChange < -0.5) {
      sentiment = 'bearish'
      strength = Math.min(Math.abs(priceChange) / 2, 3)
    }
    
    return { sentiment, strength, priceChange, volume }
  }

  analyzeVolatility(data) {
    if (data.length < 20) return { level: 'low', atr: 0 }
    
    const atr = this.calculateATR(data)
    const currentATR = atr[atr.length - 1] || 0
    const avgATR = atr.reduce((a, b) => a + b, 0) / atr.length
    
    let level = 'low'
    if (currentATR > avgATR * 1.5) level = 'high'
    else if (currentATR > avgATR * 1.2) level = 'medium'
    
    return { level, atr: currentATR, average: avgATR }
  }

  combineAnalyses(analyses) {
    const { technical, patterns, sentiment, volatility } = analyses
    
    let finalScore = technical.score
    let confidence = 0.5
    
    // Adjust score based on patterns
    patterns.chartPatterns.forEach(pattern => {
      if (pattern.bullish) {
        finalScore += 1
        confidence += 0.1
      } else {
        finalScore -= 1
        confidence += 0.1
      }
    })
    
    patterns.candlestickPatterns.forEach(pattern => {
      if (pattern.bullish) {
        finalScore += 0.5
        confidence += 0.05
      } else {
        finalScore -= 0.5
        confidence += 0.05
      }
    })
    
    // Adjust score based on sentiment
    if (sentiment.sentiment === 'bullish') {
      finalScore += sentiment.strength * 0.5
      confidence += 0.1
    } else if (sentiment.sentiment === 'bearish') {
      finalScore -= sentiment.strength * 0.5
      confidence += 0.1
    }
    
    // Adjust confidence based on volatility
    if (volatility.level === 'high') {
      confidence -= 0.1
    } else if (volatility.level === 'low') {
      confidence += 0.05
    }
    
    // Determine final signal
    let signal = 'HOLD'
    if (finalScore > 2) signal = 'BUY'
    else if (finalScore < -2) signal = 'SELL'
    
    // Calculate confidence percentage
    confidence = Math.max(0.1, Math.min(0.95, confidence))
    
    return {
      signal,
      confidence: Math.round(confidence * 100),
      score: Math.round(finalScore * 10) / 10,
      reasoning: this.generateReasoning(analyses, signal),
      riskLevel: this.calculateRiskLevel(volatility, confidence),
      entryPrice: this.calculateEntryPrice(analyses),
      stopLoss: this.calculateStopLoss(analyses),
      takeProfit: this.calculateTakeProfit(analyses)
    }
  }

  generateReasoning(analyses, signal) {
    const reasons = []
    const { technical, patterns, sentiment, volatility } = analyses
    
    // Technical reasons
    technical.signals.forEach(signal => {
      reasons.push(`${signal.indicator} showing ${signal.signal} signal (${signal.strength})`)
    })
    
    // Pattern reasons
    patterns.chartPatterns.forEach(pattern => {
      reasons.push(`${pattern.name} pattern detected - ${pattern.bullish ? 'bullish' : 'bearish'} ${pattern.type}`)
    })
    
    patterns.candlestickPatterns.forEach(pattern => {
      reasons.push(`${pattern.name} candlestick pattern - ${pattern.bullish ? 'bullish' : 'bearish'} ${pattern.type}`)
    })
    
    // Sentiment reasons
    if (sentiment.sentiment !== 'neutral') {
      reasons.push(`Market sentiment is ${sentiment.sentiment} (${sentiment.strength.toFixed(1)} strength)`)
    }
    
    // Volatility reasons
    reasons.push(`Volatility is ${volatility.level} (ATR: ${volatility.atr.toFixed(4)})`)
    
    return reasons
  }

  calculateRiskLevel(volatility, confidence) {
    if (volatility.level === 'high' && confidence < 0.7) return 'high'
    if (volatility.level === 'low' && confidence > 0.8) return 'low'
    return 'medium'
  }

  calculateEntryPrice(analyses) {
    // Use current price as entry price
    return analyses.technical.signals.length > 0 ? 
      analyses.technical.signals[0].value : 0
  }

  calculateStopLoss(analyses) {
    const { volatility } = analyses
    const atr = volatility.atr
    
    // Stop loss at 2x ATR
    return atr * 2
  }

  calculateTakeProfit(analyses) {
    const { volatility } = analyses
    const atr = volatility.atr
    
    // Take profit at 3x ATR (risk-reward ratio of 1:1.5)
    return atr * 3
  }
}

export default AIMarketAnalyzer
