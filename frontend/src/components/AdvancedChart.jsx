import React, { useState, useEffect } from 'react'
import { Card, Select, Row, Col, Typography, Space, Tooltip } from 'antd'
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  AreaChartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
  Cell
} from 'recharts'

const { Title, Text } = Typography

const AdvancedChart = ({ data = [], selectedPair = 'EUR/USD', chartStyle = 'line', onChartStyleChange }) => {
  const [chartData, setChartData] = useState([])
  const [currentChartStyle, setCurrentChartStyle] = useState(chartStyle)
  const [hoveredCandle, setHoveredCandle] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [lastUpdateTime, setLastUpdateTime] = useState(null)

  // Update local chart style when prop changes
  useEffect(() => {
    setCurrentChartStyle(chartStyle)
  }, [chartStyle])

  // Handle chart style change
  const handleChartStyleChange = (newStyle) => {
    setCurrentChartStyle(newStyle)
    if (onChartStyleChange) {
      onChartStyleChange(newStyle)
    }
  }

  // Transform data for chart display with real-time optimization
  useEffect(() => {
    if (data && data.length > 0) {
      const currentTime = Date.now()
      
      // Check if this is a real-time update (data changed)
      const isRealTimeUpdate = lastUpdateTime && currentTime - lastUpdateTime < 2000 // Within 2 seconds
      
      if (isRealTimeUpdate && chartData.length > 0) {
        // For real-time updates, append new data points instead of replacing
        const newDataPoints = data.slice(chartData.length).map((item, index) => {
          const open = parseFloat(item.open)
          const high = parseFloat(item.high)
          const low = parseFloat(item.low)
          const close = parseFloat(item.close)
          
          let timeValue
          if (typeof item.timestamp === 'string') {
            timeValue = new Date(item.timestamp).getTime()
          } else if (typeof item.time === 'string') {
            timeValue = new Date(item.time).getTime()
          } else if (typeof item.time === 'number') {
            timeValue = item.time
          } else {
            timeValue = Date.now() - (data.length - chartData.length - index) * 60 * 60 * 1000
          }
          
          return {
            time: timeValue,
            price: close,
            volume: item.volume || Math.floor(Math.random() * 1000) + 100,
            open: open,
            high: high,
            low: low,
            close: close,
            candleHigh: high,
            candleLow: low,
            candleBody: Math.abs(close - open),
            candleColor: close > open ? '#52c41a' : '#ff4d4f'
          }
        })
        
        // Append new data points and maintain chronological order
        const updatedData = [...chartData, ...newDataPoints]
          .sort((a, b) => a.time - b.time)
          .slice(-100) // Keep only last 100 data points for performance
        
        setChartData(updatedData)
      } else {
        // Full data refresh - transform all data
        const transformedData = data.map((item, index) => {
          const open = parseFloat(item.open)
          const high = parseFloat(item.high)
          const low = parseFloat(item.low)
          const close = parseFloat(item.close)
          
          let timeValue
          if (typeof item.timestamp === 'string') {
            timeValue = new Date(item.timestamp).getTime()
          } else if (typeof item.time === 'string') {
            timeValue = new Date(item.time).getTime()
          } else if (typeof item.time === 'number') {
            timeValue = item.time
          } else {
            timeValue = Date.now() - (data.length - index) * 60 * 60 * 1000
          }
          
          return {
            time: timeValue,
            price: close,
            volume: item.volume || Math.floor(Math.random() * 1000) + 100,
            open: open,
            high: high,
            low: low,
            close: close,
            candleHigh: high,
            candleLow: low,
            candleBody: Math.abs(close - open),
            candleColor: close > open ? '#52c41a' : '#ff4d4f'
          }
        })
        
        // Sort by time to ensure chronological order (oldest to newest)
        const sortedData = transformedData.sort((a, b) => a.time - b.time)
        
        setChartData(sortedData)
      }
      
      setLastUpdateTime(currentTime)
    }
  }, [data, selectedPair, lastUpdateTime])


  // Custom Candlestick Component with TradingView-style appearance
  const CandlestickSVG = ({ data, index, width, height, minPrice, maxPrice, chartWidth, totalCandles, onHover, onLeave }) => {
    const { open, high, low, close } = data
    const isBullish = close > open
    
    // Calculate positions with better spacing
    const priceRange = maxPrice - minPrice
    const candleWidth = chartWidth / totalCandles * 0.7 // Increased from 0.6 to 0.7 for better visibility
    const candleSpacing = chartWidth / totalCandles
    const x = index * candleSpacing + candleSpacing * 0.15 // Adjusted positioning
    
    // Calculate Y positions (inverted because SVG Y increases downward)
    const highY = ((maxPrice - high) / priceRange) * height
    const lowY = ((maxPrice - low) / priceRange) * height
    const openY = ((maxPrice - open) / priceRange) * height
    const closeY = ((maxPrice - close) / priceRange) * height
    
    // Calculate body dimensions with better proportions
    const bodyTop = Math.min(openY, closeY)
    const bodyBottom = Math.max(openY, closeY)
    const bodyHeight = Math.max(4, bodyBottom - bodyTop) // Increased minimum height from 3 to 4
    
    // TradingView-style colors
    const bodyColor = isBullish ? '#26a69a' : '#ef5350'
    const wickColor = isBullish ? '#26a69a' : '#ef5350'
    
    return (
      <g>
        {/* Invisible hover area for better interaction */}
        <rect
          x={x - candleSpacing * 0.1}
          y={0}
          width={candleSpacing * 1.2}
          height={height}
          fill="transparent"
          onMouseEnter={() => onHover && onHover(data, index)}
          onMouseLeave={() => onLeave && onLeave()}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Wick (High-Low line) - TradingView style */}
        <line
          x1={x + candleWidth / 2}
          y1={highY}
          x2={x + candleWidth / 2}
          y2={lowY}
          stroke={wickColor}
          strokeWidth={1.5} // Slightly thinner for cleaner look
          strokeLinecap="round"
        />
        
        {/* Body - TradingView style with proper proportions */}
        <rect
          x={x}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={isBullish ? bodyColor : 'transparent'} // Hollow body for bearish candles
          stroke={bodyColor}
          strokeWidth={1.5} // Slightly thinner for cleaner look
          rx={1} // Rounded corners for modern look
          ry={1}
        />
      </g>
    )
  }

  const renderCandlestickChart = () => {
    if (!chartData || chartData.length === 0) return null
    
    const minPrice = Math.min(...chartData.map(d => d.low))
    const maxPrice = Math.max(...chartData.map(d => d.high))
    const priceRange = maxPrice - minPrice
    
    // Enhanced scaling for better visualization of small price movements
    let padding
    if (priceRange < 0.001) {
      // Very small range - use larger padding for better visibility
      padding = Math.max(priceRange * 2, 0.0005) // At least 0.0005 padding
    } else if (priceRange < 0.01) {
      // Small range - use moderate padding
      padding = priceRange * 0.5
    } else {
      // Normal range - use standard padding
      padding = priceRange * 0.1
    }
    
    const adjustedMinPrice = minPrice - padding
    const adjustedMaxPrice = maxPrice + padding
    
    const chartWidth = 800
    const chartHeight = 400
    
    const handleCandleHover = (data, index) => {
      setHoveredCandle({ data, index })
    }
    
    const handleCandleLeave = () => {
      setHoveredCandle(null)
    }
    
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    
    return (
      <div 
        style={{ width: '100%', height: '400px', position: 'relative' }}
        onMouseMove={handleMouseMove}
      >
        {/* Professional TradingView-style Background Grid */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Horizontal grid lines - TradingView style */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={ratio * chartHeight}
              x2="100%"
              y2={ratio * chartHeight}
              stroke={i === 0 || i === 5 ? "#404040" : "#2a2a2a"} // Stronger lines for top/bottom
              strokeDasharray={i === 0 || i === 5 ? "none" : "2 2"} // Solid lines for borders
              strokeWidth={i === 0 || i === 5 ? 1 : 0.5}
            />
          ))}
          
          {/* Vertical grid lines - TradingView style */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={ratio * chartWidth}
              y1="0"
              x2={ratio * chartWidth}
              y2="100%"
              stroke={i === 0 || i === 4 ? "#404040" : "#2a2a2a"} // Stronger lines for left/right
              strokeDasharray={i === 0 || i === 4 ? "none" : "2 2"} // Solid lines for borders
              strokeWidth={i === 0 || i === 4 ? 1 : 0.5}
            />
          ))}
          
          {/* Candlesticks */}
          {chartData.map((data, index) => (
            <CandlestickSVG
              key={index}
              data={data}
              index={index}
              width={chartWidth / chartData.length}
              height={chartHeight}
              minPrice={adjustedMinPrice}
              maxPrice={adjustedMaxPrice}
              chartWidth={chartWidth}
              totalCandles={chartData.length}
              onHover={handleCandleHover}
              onLeave={handleCandleLeave}
            />
          ))}
        </svg>
        
        {/* Professional Price Labels - TradingView Style */}
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: '15px 8px',
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(2px)'
        }}>
          {[adjustedMaxPrice, (adjustedMaxPrice + adjustedMinPrice) / 2, adjustedMinPrice].map((price, i) => (
            <div key={i} style={{ 
              color: '#b0b0b0', 
              fontSize: '11px',
              fontWeight: '500',
              fontFamily: 'monospace',
              textAlign: 'right',
              minWidth: '60px'
            }}>
              {price.toFixed(4)}
            </div>
          ))}
        </div>
        
        {/* Professional Time Labels - TradingView Style */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '8px 15px',
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(2px)'
        }}>
          {chartData.filter((_, i) => i % Math.ceil(chartData.length / 5) === 0).map((data, i) => (
            <div key={i} style={{ 
              color: '#b0b0b0', 
              fontSize: '11px',
              fontWeight: '500',
              fontFamily: 'monospace'
            }}>
              {new Date(data.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          ))}
        </div>
        
        {/* Professional TradingView-style Tooltip */}
        {hoveredCandle && (
          <div
            style={{
              position: 'absolute',
              left: tooltipPosition.x + 15,
              top: tooltipPosition.y - 15,
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
              fontSize: '12px',
              zIndex: 1000,
              pointerEvents: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ 
              marginBottom: '12px', 
              fontSize: '13px', 
              fontWeight: '600',
              color: '#e0e0e0',
              borderBottom: '1px solid #333',
              paddingBottom: '8px'
            }}>
              {new Date(hoveredCandle.data.time).toLocaleString()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b0b0b0' }}>Open:</span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{hoveredCandle.data.open?.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b0b0b0' }}>High:</span>
                <span style={{ color: '#26a69a', fontWeight: '500' }}>{hoveredCandle.data.high?.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b0b0b0' }}>Low:</span>
                <span style={{ color: '#ef5350', fontWeight: '500' }}>{hoveredCandle.data.low?.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b0b0b0' }}>Close:</span>
                <span style={{ color: hoveredCandle.data.close > hoveredCandle.data.open ? '#26a69a' : '#ef5350', fontWeight: '500' }}>
                  {hoveredCandle.data.close?.toFixed(4)}
                </span>
              </div>
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '11px', 
              color: hoveredCandle.data.close > hoveredCandle.data.open ? '#26a69a' : '#ef5350',
              fontWeight: '600',
              textAlign: 'center',
              padding: '4px 8px',
              backgroundColor: hoveredCandle.data.close > hoveredCandle.data.open ? 'rgba(38, 166, 154, 0.1)' : 'rgba(239, 83, 80, 0.1)',
              borderRadius: '4px'
            }}>
              {hoveredCandle.data.close > hoveredCandle.data.open ? '↗ Bullish' : '↘ Bearish'}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderOHLCChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#8c8c8c' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={{ stroke: '#2a2a2a' }}
          />
          <YAxis 
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tick={{ fontSize: 12, fill: '#8c8c8c' }}
            tickFormatter={(value) => value.toFixed(4)}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={{ stroke: '#2a2a2a' }}
          />
          <RechartsTooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                const isBullish = data.close > data.open
                return (
                  <div style={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    padding: '12px',
                    color: '#fff'
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                      {new Date(label).toLocaleString()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                      <div>Open: <span style={{ color: '#8c8c8c' }}>{data.open?.toFixed(4)}</span></div>
                      <div>High: <span style={{ color: '#52c41a' }}>{data.high?.toFixed(4)}</span></div>
                      <div>Low: <span style={{ color: '#ff4d4f' }}>{data.low?.toFixed(4)}</span></div>
                      <div>Close: <span style={{ color: isBullish ? '#52c41a' : '#ff4d4f' }}>{data.close?.toFixed(4)}</span></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: isBullish ? '#52c41a' : '#ff4d4f' }}>
                      {isBullish ? '↗ Bullish' : '↘ Bearish'}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          
          {/* OHLC Bars - Simple representation */}
          <Bar 
            dataKey="high" 
            fill="#52c41a" 
            fillOpacity={0.3}
            name="High"
            radius={[0, 0, 0, 0]}
            stroke="#52c41a"
            strokeWidth={1}
          />
          <Bar 
            dataKey="low" 
            fill="#ff4d4f" 
            fillOpacity={0.3}
            name="Low"
            radius={[0, 0, 0, 0]}
            stroke="#ff4d4f"
            strokeWidth={1}
          />
          <Bar 
            dataKey="close" 
            fill="#52c41a" 
            fillOpacity={0.8}
            name="Close"
            radius={[0, 0, 0, 0]}
            stroke="#52c41a"
            strokeWidth={2}
          />
          <Bar 
            dataKey="open" 
            fill="#ff4d4f" 
            fillOpacity={0.8}
            name="Open"
            radius={[0, 0, 0, 0]}
            stroke="#ff4d4f"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const renderHeikinAshiChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis 
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <RechartsTooltip 
            formatter={(value, name) => [value.toFixed(4), name]}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#722ed1" 
            fill="#722ed1" 
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#8c8c8c' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={{ stroke: '#2a2a2a' }}
          />
          <YAxis 
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tick={{ fontSize: 12, fill: '#8c8c8c' }}
            tickFormatter={(value) => value.toFixed(4)}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={{ stroke: '#2a2a2a' }}
          />
          <RechartsTooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    padding: '12px',
                    color: '#fff'
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                      {new Date(label).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Price: <span style={{ color: '#1890ff' }}>{payload[0].value?.toFixed(4)}</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#1890ff" 
            strokeWidth={2}
            dot={{ fill: '#1890ff', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6, stroke: '#1890ff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderAreaChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis 
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <RechartsTooltip 
            formatter={(value, name) => [value.toFixed(4), name]}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#52c41a" 
            fill="#52c41a" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis 
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <RechartsTooltip 
            formatter={(value, name) => [value.toFixed(4), name]}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Bar 
            dataKey="price" 
            fill="#faad14" 
            fillOpacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderVolumeChart = () => {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <RechartsTooltip 
            formatter={(value, name) => [value.toLocaleString(), name]}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Bar 
            dataKey="volume" 
            fill="#722ed1" 
            fillOpacity={0.6}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const getChartIcon = (style) => {
    switch (style) {
      case 'line':
        return <LineChartOutlined />
      case 'area':
        return <AreaChartOutlined />
      case 'bar':
        return <BarChartOutlined />
      case 'candlestick':
        return <BarChartOutlined />
      case 'ohlc':
        return <BarChartOutlined />
      default:
        return <LineChartOutlined />
    }
  }

  const renderChart = () => {
    switch (currentChartStyle) {
      case 'candlestick':
        return renderCandlestickChart()
      case 'ohlc':
        return renderOHLCChart()
      case 'heikin-ashi':
        return renderHeikinAshiChart()
      case 'area':
        return renderAreaChart()
      case 'bar':
        return renderBarChart()
      default:
        return renderLineChart()
    }
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card 
        title={
          <Space>
            {getChartIcon(currentChartStyle)}
            {selectedPair} Price Chart
          </Space>
        }
        className="chart-container"
      >
        <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No chart data available</div>
          <div style={{ fontSize: '12px' }}>Loading price data for {selectedPair}...</div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {/* Main Price Chart */}
      <Card 
        title={
          <Space>
            {getChartIcon(currentChartStyle)}
            <span>{selectedPair} Price Chart - {currentChartStyle ? currentChartStyle.charAt(0).toUpperCase() + currentChartStyle.slice(1).replace('-', ' ') : 'Line'}</span>
            {lastUpdateTime && Date.now() - lastUpdateTime < 2000 && (
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#52c41a', 
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }} />
            )}
            {chartData.length > 0 && (() => {
              const minPrice = Math.min(...chartData.map(d => d.low))
              const maxPrice = Math.max(...chartData.map(d => d.high))
              const priceRange = maxPrice - minPrice
              if (priceRange < 0.001) {
                return <span style={{ fontSize: '12px', color: '#8c8c8c' }}>(Micro movements)</span>
              }
              return null
            })()}
          </Space>
        }
        className="chart-container"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '8px'
        }}
        styles={{
          header: {
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #2a2a2a',
            color: '#fff'
          },
          body: {
            backgroundColor: '#1a1a1a',
            padding: '16px'
          }
        }}
        extra={
          <Space>
            <Select
              value={currentChartStyle}
              onChange={handleChartStyleChange}
              style={{ width: 140 }}
              size="small"
              options={[
                { value: 'line', label: 'Line Chart', icon: <LineChartOutlined /> },
                { value: 'area', label: 'Area Chart', icon: <AreaChartOutlined /> },
                { value: 'bar', label: 'Bar Chart', icon: <BarChartOutlined /> },
                { value: 'candlestick', label: 'Candlestick', icon: <BarChartOutlined /> },
                { value: 'ohlc', label: 'OHLC Bars', icon: <BarChartOutlined /> },
                { value: 'heikin-ashi', label: 'Heikin Ashi', icon: <AreaChartOutlined /> }
              ]}
            />
            <Tooltip title="Advanced chart types show different perspectives of price data. Candlestick shows true OHLC candlesticks like TradingView.">
              <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
          </Space>
        }
      >
        {renderChart()}
      </Card>

      {/* Volume Chart */}
      <Card 
        title="Volume Analysis"
        style={{ 
          marginTop: 16,
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '8px'
        }}
        styles={{
          header: {
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #2a2a2a',
            color: '#fff'
          },
          body: {
            backgroundColor: '#1a1a1a',
            padding: '16px'
          }
        }}
        size="small"
      >
        {renderVolumeChart()}
      </Card>
    </div>
  )
}

export default AdvancedChart
