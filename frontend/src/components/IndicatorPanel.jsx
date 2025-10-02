import React from 'react'
import { Card, Row, Col, Progress, Tag } from 'antd'
import { useTheme } from '../contexts/ThemeContext'

const IndicatorPanel = ({ indicators = {} }) => {
  const { isDarkMode, colors } = useTheme()
  
  const getRSIColor = (value) => {
    if (value < 30) return '#52c41a' // Oversold - Green
    if (value > 70) return '#ff4d4f' // Overbought - Red
    return '#1890ff' // Neutral - Blue
  }

  const getRSILabel = (value) => {
    if (value < 30) return 'Oversold'
    if (value > 70) return 'Overbought'
    return 'Neutral'
  }

  const getMACDColor = (bullish) => {
    return bullish ? '#52c41a' : '#ff4d4f'
  }

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'uptrend': return '#52c41a'
      case 'downtrend': return '#ff4d4f'
      default: return '#1890ff'
    }
  }

  // Handle null/undefined indicators gracefully
  if (!indicators || indicators === null || Object.keys(indicators).length === 0) {
    return (
      <Card 
        title="Technical Indicators" 
        className="indicator-panel"
        style={{ 
          background: isDarkMode ? colors.surface : colors.surface,
          border: `1px solid ${colors.border}`,
          color: colors.text
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: colors.textSecondary, marginBottom: '16px' }}>
            No indicator data available
          </p>
          <p style={{ fontSize: '12px', color: colors.textTertiary }}>
            Configure real data sources to see technical indicators
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="Technical Indicators" 
      className="indicator-panel"
      style={{ 
        background: isDarkMode ? colors.surface : colors.surface,
        border: `1px solid ${colors.border}`,
        color: colors.text
      }}
    >
      <Row gutter={[16, 16]}>
        {/* RSI */}
        <Col span={24}>
          <div className="indicator-card">
            <div className="indicator-title">RSI (14)</div>
            <div className="indicator-value" style={{ color: getRSIColor(indicators.rsi?.value || 50) }}>
              {(Number(indicators.rsi?.value) || 50).toFixed(1)}
            </div>
            <Progress
              percent={indicators.rsi?.value || 50}
              strokeColor={getRSIColor(indicators.rsi?.value || 50)}
              showInfo={false}
              size="small"
            />
            <Tag 
              color={indicators.rsi?.oversold ? 'green' : indicators.rsi?.overbought ? 'red' : 'blue'}
              style={{ marginTop: 4 }}
            >
              {getRSILabel(indicators.rsi?.value || 50)}
            </Tag>
          </div>
        </Col>

        {/* MACD */}
        <Col span={24}>
          <div className="indicator-card">
            <div className="indicator-title">MACD</div>
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>MACD</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(Number(indicators.macd?.macd) || 0).toFixed(6)}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Signal</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(Number(indicators.macd?.signal) || 0).toFixed(6)}
                </div>
              </Col>
            </Row>
            <Tag 
              color={indicators.macd?.bullish ? 'green' : 'red'}
              style={{ marginTop: 8 }}
            >
              {indicators.macd?.bullish ? 'Bullish' : 'Bearish'}
            </Tag>
          </div>
        </Col>

        {/* Bollinger Bands */}
        <Col span={24}>
          <div className="indicator-card">
            <div className="indicator-title">Bollinger Bands</div>
            <Row gutter={8}>
              <Col span={8}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Upper</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(Number(indicators.bollingerBands?.upper) || 0).toFixed(5)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Middle</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(Number(indicators.bollingerBands?.middle) || 0).toFixed(5)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Lower</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(Number(indicators.bollingerBands?.lower) || 0).toFixed(5)}
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 8 }}>
              <Tag color={indicators.bollingerBands?.squeeze ? 'orange' : 'blue'}>
                {indicators.bollingerBands?.squeeze ? 'Squeeze' : 'Normal'}
              </Tag>
            </div>
          </div>
        </Col>

        {/* Trend */}
        <Col span={24}>
          <div className="indicator-card">
            <div className="indicator-title">Trend Analysis</div>
            <div className="indicator-value" style={{ color: getTrendColor(indicators.trend?.direction || 'neutral') }}>
              {(indicators.trend?.direction || 'neutral').charAt(0).toUpperCase() + (indicators.trend?.direction || 'neutral').slice(1)}
            </div>
            <Progress
              percent={(indicators.trend?.strength || 0) * 33.33}
              strokeColor={getTrendColor(indicators.trend?.direction || 'neutral')}
              showInfo={false}
              size="small"
            />
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 4 }}>
              Strength: {indicators.trend?.strength || 0}/3
            </div>
          </div>
        </Col>

        {/* Volume */}
        <Col span={24}>
          <div className="indicator-card">
            <div className="indicator-title">Volume Analysis</div>
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Current</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(indicators.volume?.current || 0).toLocaleString()}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Average</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {(indicators.volume?.average || 0).toLocaleString()}
                </div>
              </Col>
            </Row>
            <Tag 
              color={indicators.volume?.aboveAverage ? 'green' : 'blue'}
              style={{ marginTop: 8 }}
            >
              {indicators.volume?.aboveAverage ? 'Above Average' : 'Normal'}
            </Tag>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default IndicatorPanel
