import React from 'react'
import { Card, Tag, Statistic, Row, Col, Progress } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  MinusOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

const SignalCard = ({ signal, pair, indicators = {} }) => {
  const { isDarkMode, colors } = useTheme()
  
  const getSignalColor = (action) => {
    switch (action) {
      case 'BUY':
        return '#52c41a'
      case 'SELL':
        return '#ff4d4f'
      default:
        return '#faad14'
    }
  }

  const getSignalIcon = (action) => {
    switch (action) {
      case 'BUY':
        return <ArrowUpOutlined />
      case 'SELL':
        return <ArrowDownOutlined />
      default:
        return <MinusOutlined />
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#52c41a'
    if (confidence >= 60) return '#1890ff'
    if (confidence >= 40) return '#faad14'
    return '#ff4d4f'
  }

  // Handle null/undefined signal data gracefully
  if (!signal || signal === null) {
    return (
      <Card 
        title={`Trading Signal for ${pair}`} 
        style={{ 
          marginBottom: 16,
          background: isDarkMode ? colors.surface : colors.surface,
          border: `1px solid ${colors.border}`,
          color: colors.text
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: colors.textSecondary, marginBottom: '16px' }}>
            No signal data available
          </p>
          <p style={{ fontSize: '12px', color: colors.textTertiary }}>
            Configure real data sources to see trading signals
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="Trading Signal" 
      className="signal-card"
      style={{ 
        marginBottom: 16,
        background: isDarkMode ? colors.surface : colors.surface,
        border: `1px solid ${colors.border}`,
        color: colors.text
      }}
    >
      <div className="signal-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="signal-action" style={{ color: colors.text }}>
              {getSignalIcon(signal.action)} {signal.action}
            </div>
            <div className="signal-confidence" style={{ color: colors.textSecondary }}>
              Confidence: {signal.confidence}%
            </div>
          </div>
          <div className="signal-price" style={{ color: colors.text }}>
            <DollarOutlined /> {signal.price}
          </div>
        </div>
        
        <Progress
          percent={signal.confidence}
          strokeColor={getConfidenceColor(signal.confidence)}
          showInfo={false}
          style={{ marginTop: 12 }}
        />
      </div>

      <div className="signal-body">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Stop Loss"
              value={signal.stopLoss}
              precision={5}
              valueStyle={{ 
                color: '#ff4d4f',
                fontSize: '16px'
              }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Take Profit"
              value={signal.takeProfit}
              precision={5}
              valueStyle={{ 
                color: '#52c41a',
                fontSize: '16px'
              }}
            />
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontSize: '14px', color: colors.textSecondary }}>
            Signal Reasoning:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Tag color={indicators.rsi?.oversold ? 'green' : indicators.rsi?.overbought ? 'red' : 'blue'}>
              RSI: {(Number(indicators.rsi?.value) || 0).toFixed(1)}
            </Tag>
            <Tag color={indicators.macd?.bullish ? 'green' : indicators.macd?.bearish ? 'red' : 'blue'}>
              MACD: {indicators.macd?.bullish ? 'Bullish' : indicators.macd?.bearish ? 'Bearish' : 'Neutral'}
            </Tag>
            <Tag color={indicators.trend?.direction === 'uptrend' ? 'green' : indicators.trend?.direction === 'downtrend' ? 'red' : 'blue'}>
              Trend: {indicators.trend?.direction || 'N/A'}
            </Tag>
            <Tag color={indicators.volume?.aboveAverage ? 'green' : 'blue'}>
              Volume: {indicators.volume?.aboveAverage ? 'High' : 'Normal'}
            </Tag>
          </div>
        </div>

        <div style={{ 
          marginTop: 16, 
          padding: '12px', 
          background: isDarkMode ? colors.surfaceElevated : colors.surfaceElevated, 
          borderRadius: '6px',
          fontSize: '12px',
          color: colors.textSecondary,
          border: `1px solid ${colors.borderSecondary}`
        }}>
          <div>Pair: {pair}</div>
          <div>Generated: {new Date(signal.timestamp).toLocaleString()}</div>
          <div>Risk Level: {signal.confidence > 70 ? 'High' : signal.confidence > 50 ? 'Medium' : 'Low'}</div>
        </div>
      </div>
    </Card>
  )
}

export default SignalCard
