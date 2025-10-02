import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  Progress, 
  Alert, 
  Space, 
  Typography, 
  Divider,
  Tooltip,
  Badge,
  List,
  Timeline,
  Table,
  Button,
  Select,
  Spin
} from 'antd'
import { 
  CaretUpOutlined, 
  CaretDownOutlined, 
  PauseCircleOutlined,
  BulbOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons'
import { fetchAIMarketAnalysis } from '../services/apiService'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const AIMarketAnalysis = ({ selectedPair }) => {
  const [timeframe, setTimeframe] = useState('1h')
  const [analysisLimit, setAnalysisLimit] = useState(200) // Increased for better MACD calculation

  // Fetch AI Market Analysis
  const { data: analysisData, isLoading, error, refetch } = useQuery({
    queryKey: ['aiMarketAnalysis', selectedPair, timeframe, analysisLimit],
    queryFn: () => fetchAIMarketAnalysis(selectedPair, timeframe, analysisLimit),
    refetchInterval: 1000, // Auto-refresh every 1 second
    refetchIntervalInBackground: true,
    enabled: !!selectedPair
  })

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY': return <CaretUpOutlined style={{ color: '#52c41a' }} />
      case 'SELL': return <CaretDownOutlined style={{ color: '#ff4d4f' }} />
      default: return <PauseCircleOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return '#52c41a'
      case 'SELL': return '#ff4d4f'
      default: return '#8c8c8c'
    }
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return '#52c41a'
      case 'medium': return '#faad14'
      case 'high': return '#ff4d4f'
      default: return '#8c8c8c'
    }
  }

  const getVolatilityColor = (level) => {
    switch (level) {
      case 'Low': return '#52c41a'
      case 'Medium': return '#faad14'
      case 'High': return '#ff4d4f'
      default: return '#8c8c8c'
    }
  }

  const formatPrice = (price) => {
    return price ? price.toFixed(4) : 'N/A'
  }

  const formatPercentage = (value) => {
    return value ? `${value.toFixed(2)}%` : 'N/A'
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Text>Analyzing market data with AI...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="Analysis Error"
        description={`Failed to analyze ${selectedPair}: ${error.message}`}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  if (!analysisData) {
    return (
      <Alert
        message="No Data"
        description="No analysis data available for the selected currency pair."
        type="warning"
        showIcon
      />
    )
  }

  const { analysis, tradingRecommendation, longTermAnalysis, technicalIndicators, marketInsights, riskAssessment, liveData } = analysisData

  // Technical Indicators Table Data
  const technicalData = [
    {
      key: 'rsi',
      indicator: 'RSI (14)',
      value: formatPercentage(technicalIndicators.rsi),
      signal: technicalIndicators.rsi > 70 ? 'Overbought' : technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral',
      color: technicalIndicators.rsi > 70 ? '#ff4d4f' : technicalIndicators.rsi < 30 ? '#52c41a' : '#8c8c8c'
    },
    {
      key: 'macd',
      indicator: 'MACD',
      value: technicalIndicators.macd && technicalIndicators.macd.macd !== undefined 
        ? technicalIndicators.macd.macd.toFixed(6) 
        : 'N/A',
      signal: technicalIndicators.macd && technicalIndicators.macd.histogram !== undefined
        ? (technicalIndicators.macd.histogram > 0 ? 'Bullish' : 'Bearish')
        : 'N/A',
      color: technicalIndicators.macd && technicalIndicators.macd.histogram !== undefined
        ? (technicalIndicators.macd.histogram > 0 ? '#52c41a' : '#ff4d4f')
        : '#8c8c8c'
    },
    {
      key: 'stochastic',
      indicator: 'Stochastic %K',
      value: formatPercentage(technicalIndicators.oscillators.stochastic.k),
      signal: technicalIndicators.oscillators.stochastic.k > 80 ? 'Overbought' : technicalIndicators.oscillators.stochastic.k < 20 ? 'Oversold' : 'Neutral',
      color: technicalIndicators.oscillators.stochastic.k > 80 ? '#ff4d4f' : technicalIndicators.oscillators.stochastic.k < 20 ? '#52c41a' : '#8c8c8c'
    },
    {
      key: 'williams',
      indicator: 'Williams %R',
      value: formatPercentage(technicalIndicators.oscillators.williamsR),
      signal: technicalIndicators.oscillators.williamsR > -20 ? 'Overbought' : technicalIndicators.oscillators.williamsR < -80 ? 'Oversold' : 'Neutral',
      color: technicalIndicators.oscillators.williamsR > -20 ? '#ff4d4f' : technicalIndicators.oscillators.williamsR < -80 ? '#52c41a' : '#8c8c8c'
    }
  ]

  const technicalColumns = [
    {
      title: 'Indicator',
      dataIndex: 'indicator',
      key: 'indicator',
      width: 120
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 100
    },
    {
      title: 'Signal',
      dataIndex: 'signal',
      key: 'signal',
      render: (signal, record) => (
        <Tag color={record.color}>{signal}</Tag>
      ),
      width: 100
    }
  ]

  return (
    <div style={{ padding: '20px' }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: '20px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <BulbOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Professional AI Trading Analysis - {selectedPair}
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeframe}
                onChange={setTimeframe}
                style={{ width: 100 }}
              >
                <Option value="5m">5m</Option>
                <Option value="15m">15m</Option>
                <Option value="1h">1h</Option>
                <Option value="4h">4h</Option>
                <Option value="1d">1d</Option>
              </Select>
              <Select
                value={analysisLimit}
                onChange={setAnalysisLimit}
                style={{ width: 120 }}
              >
                <Option value={50}>50 periods</Option>
                <Option value={100}>100 periods</Option>
                <Option value={200}>200 periods</Option>
              </Select>
              <Button onClick={() => refetch()} type="primary">
                Refresh Analysis
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Analysis Result */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="AI Signal"
                value={analysis.signal}
                prefix={getSignalIcon(analysis.signal)}
                valueStyle={{ color: getSignalColor(analysis.signal), fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Confidence"
                value={analysis.confidence}
                suffix="%"
                valueStyle={{ color: analysis.confidence > 70 ? '#52c41a' : analysis.confidence > 50 ? '#faad14' : '#ff4d4f' }}
              />
              <Progress 
                percent={analysis.confidence} 
                size="small" 
                strokeColor={analysis.confidence > 70 ? '#52c41a' : analysis.confidence > 50 ? '#faad14' : '#ff4d4f'}
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Analysis Score"
                value={analysis.score}
                valueStyle={{ color: analysis.score > 0 ? '#52c41a' : analysis.score < 0 ? '#ff4d4f' : '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Risk Level"
                value={analysis.riskLevel}
                valueStyle={{ color: getRiskLevelColor(analysis.riskLevel), textTransform: 'capitalize' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Trading Recommendations */}
      {analysis.signal !== 'HOLD' && (
        <Card title="Trading Recommendations" style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small" title="Entry Price">
                <Statistic
                  value={formatPrice(analysis.entryPrice)}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" title="Stop Loss">
                <Statistic
                  value={formatPrice(analysis.stopLoss)}
                  valueStyle={{ fontSize: '18px', color: '#ff4d4f' }}
                />
                <Text type="secondary">
                  Risk: {formatPrice(Math.abs(analysis.entryPrice - analysis.stopLoss))}
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" title="Take Profit">
                <Statistic
                  value={formatPrice(analysis.takeProfit)}
                  valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                />
                <Text type="secondary">
                  Reward: {formatPrice(Math.abs(analysis.takeProfit - analysis.entryPrice))}
                </Text>
              </Card>
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title="Risk-Reward Ratio">
                <Statistic
                  value={riskAssessment.riskRewardRatio.toFixed(2)}
                  suffix=":1"
                  valueStyle={{ fontSize: '18px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title="Time Horizon">
                <Statistic
                  value={analysis.timeHorizon}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Long-term Strategic Analysis */}
      {longTermAnalysis && (
        <Card title="🎯 Strategic Trading Analysis" style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Alert
                message={`Definitive Signal: ${longTermAnalysis.definitiveSignal}`}
                description={`Confidence: ${longTermAnalysis.confidence}% | Trend Strength: ${longTermAnalysis.trendStrength.strength}`}
                type={longTermAnalysis.definitiveSignal === 'BUY' ? 'success' : longTermAnalysis.definitiveSignal === 'SELL' ? 'error' : 'warning'}
                showIcon
                style={{ marginBottom: '20px' }}
              />
            </Col>
            
            {/* Timeframe Recommendations */}
            <Col span={24}>
              <Title level={4}>📊 Timeframe Analysis</Title>
              <Row gutter={[8, 8]}>
                {Object.entries(longTermAnalysis.timeframes).map(([timeframe, data]) => (
                  <Col key={timeframe} span={4}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>{timeframe}</div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        color: data.signal === 'BUY' ? '#52c41a' : data.signal === 'SELL' ? '#ff4d4f' : '#8c8c8c'
                      }}>
                        {data.signal}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{data.confidence}%</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>

            {/* Entry Strategy */}
            {longTermAnalysis.entryStrategy && (
              <Col span={12}>
                <Title level={4}>🎯 Entry Strategy</Title>
                <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Signal: </Text>
                    <Tag color={longTermAnalysis.entryStrategy.type === 'BUY' ? 'green' : 'red'}>
                      {longTermAnalysis.entryStrategy.type}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Entry Price: </Text>
                    <Text style={{ color: '#1890ff' }}>{longTermAnalysis.entryStrategy.entryPrice?.toFixed(4)}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Stop Loss: </Text>
                    <Text style={{ color: '#ff4d4f' }}>{longTermAnalysis.entryStrategy.stopLoss?.toFixed(4)}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Take Profit 1: </Text>
                    <Text style={{ color: '#52c41a' }}>{longTermAnalysis.entryStrategy.takeProfit1?.toFixed(4)}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Take Profit 2: </Text>
                    <Text style={{ color: '#52c41a' }}>{longTermAnalysis.entryStrategy.takeProfit2?.toFixed(4)}</Text>
                  </div>
                  <div>
                    <Text strong style={{ color: '#e0e0e0' }}>Position Size: </Text>
                    <Text style={{ color: '#faad14' }}>{longTermAnalysis.entryStrategy.positionSize}</Text>
                  </div>
                </div>
              </Col>
            )}

            {/* Risk Management */}
            {longTermAnalysis.riskManagement && (
              <Col span={12}>
                <Title level={4}>⚠️ Risk Management</Title>
                <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Max Risk: </Text>
                    <Text style={{ color: '#ff4d4f' }}>{longTermAnalysis.riskManagement.maxRisk}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Stop Loss Distance: </Text>
                    <Text style={{ color: '#ff4d4f' }}>{longTermAnalysis.riskManagement.stopLossDistance?.toFixed(2)}%</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Risk/Reward Ratio: </Text>
                    <Text style={{ color: '#52c41a' }}>{longTermAnalysis.riskManagement.riskRewardRatio?.toFixed(2)}:1</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#e0e0e0' }}>Position Size: </Text>
                    <Text style={{ color: '#faad14' }}>{longTermAnalysis.riskManagement.positionSize}</Text>
                  </div>
                  <div>
                    <Text strong style={{ color: '#e0e0e0' }}>Max Drawdown: </Text>
                    <Text style={{ color: '#ff4d4f' }}>{longTermAnalysis.riskManagement.maxDrawdown}</Text>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* AI Reasoning */}
      <Card title="AI Analysis Reasoning" style={{ marginBottom: '20px' }}>
        <List
          dataSource={longTermAnalysis?.reasoning || analysis.reasoning}
          renderItem={(reason, index) => (
            <List.Item>
              <Space>
                <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                <Text>{reason}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* Technical Indicators */}
      <Card title="Technical Indicators" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Table
              dataSource={technicalData}
              columns={technicalColumns}
              pagination={false}
              size="small"
            />
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Moving Averages">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>SMA 20:</Text> <Text>{formatPrice(technicalIndicators.movingAverages.sma20)}</Text>
                </div>
                <div>
                  <Text strong>SMA 50:</Text> <Text>{formatPrice(technicalIndicators.movingAverages.sma50)}</Text>
                </div>
                <div>
                  <Text strong>EMA 12:</Text> <Text>{formatPrice(technicalIndicators.movingAverages.ema12)}</Text>
                </div>
                <div>
                  <Text strong>EMA 26:</Text> <Text>{formatPrice(technicalIndicators.movingAverages.ema26)}</Text>
                </div>
              </Space>
            </Card>
            <Card size="small" title="Bollinger Bands" style={{ marginTop: '10px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Upper:</Text> <Text style={{ color: '#ff4d4f' }}>{formatPrice(technicalIndicators.bollingerBands.upper)}</Text>
                </div>
                <div>
                  <Text strong>Middle:</Text> <Text>{formatPrice(technicalIndicators.bollingerBands.middle)}</Text>
                </div>
                <div>
                  <Text strong>Lower:</Text> <Text style={{ color: '#52c41a' }}>{formatPrice(technicalIndicators.bollingerBands.lower)}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Market Insights */}
      <Card title="Market Insights" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="Trend Direction">
              <Tag color={marketInsights.trendDirection === 'uptrend' ? '#52c41a' : marketInsights.trendDirection === 'downtrend' ? '#ff4d4f' : '#8c8c8c'}>
                {marketInsights.trendDirection.toUpperCase()}
              </Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="Volatility">
              <Tag color={getVolatilityColor(marketInsights.volatilityLevel)}>
                {marketInsights.volatilityLevel}
              </Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" title="Market Session">
              <Tag color="#1890ff">{marketInsights.marketSession}</Tag>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card size="small" title="Price Action">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Current:</Text> <Text>{formatPrice(marketInsights.priceAction.current)}</Text>
                </div>
                <div>
                  <Text strong>24h High:</Text> <Text style={{ color: '#52c41a' }}>{formatPrice(marketInsights.priceAction.high24h)}</Text>
                </div>
                <div>
                  <Text strong>24h Low:</Text> <Text style={{ color: '#ff4d4f' }}>{formatPrice(marketInsights.priceAction.low24h)}</Text>
                </div>
                <div>
                  <Text strong>Change:</Text> 
                  <Text style={{ color: marketInsights.priceAction.changePercent > 0 ? '#52c41a' : '#ff4d4f' }}>
                    {formatPrice(marketInsights.priceAction.change)} ({formatPercentage(marketInsights.priceAction.changePercent)})
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Support & Resistance">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Support Levels:</Text>
                  <div style={{ marginTop: '5px' }}>
                    {marketInsights.supportLevels.map((level, index) => (
                      <Tag key={index} color="green" style={{ margin: '2px' }}>
                        {formatPrice(level)}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <Text strong>Resistance Levels:</Text>
                  <div style={{ marginTop: '5px' }}>
                    {marketInsights.resistanceLevels.map((level, index) => (
                      <Tag key={index} color="red" style={{ margin: '2px' }}>
                        {formatPrice(level)}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Pattern Recognition */}
      {(marketInsights.chartPatterns.length > 0 || marketInsights.candlestickPatterns.length > 0) && (
        <Card title="Pattern Recognition" style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            {marketInsights.chartPatterns.length > 0 && (
              <Col xs={24} sm={12}>
                <Card size="small" title="Chart Patterns">
                  <Timeline>
                    {marketInsights.chartPatterns.map((pattern, index) => (
                      <Timeline.Item
                        key={index}
                        dot={pattern.bullish ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                      >
                        <Text strong>{pattern.name}</Text>
                        <br />
                        <Text type="secondary">
                          {pattern.bullish ? 'Bullish' : 'Bearish'} {pattern.type}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            )}
            {marketInsights.candlestickPatterns.length > 0 && (
              <Col xs={24} sm={12}>
                <Card size="small" title="Candlestick Patterns">
                  <Timeline>
                    {marketInsights.candlestickPatterns.map((pattern, index) => (
                      <Timeline.Item
                        key={index}
                        dot={pattern.bullish ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                      >
                        <Text strong>{pattern.name}</Text>
                        <br />
                        <Text type="secondary">
                          {pattern.bullish ? 'Bullish' : 'Bearish'} {pattern.type}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Risk Assessment */}
      <Card title="Risk Assessment" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" title="Max Drawdown">
              <Statistic
                value={formatPercentage(riskAssessment.maxDrawdown)}
                valueStyle={{ color: riskAssessment.maxDrawdown > 5 ? '#ff4d4f' : riskAssessment.maxDrawdown > 2 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" title="Sharpe Ratio">
              <Statistic
                value={riskAssessment.sharpeRatio}
                valueStyle={{ color: riskAssessment.sharpeRatio > 1 ? '#52c41a' : riskAssessment.sharpeRatio > 0 ? '#faad14' : '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" title="Recommended Position Size">
              <Statistic
                value={formatPercentage(riskAssessment.recommendedPositionSize)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Live Data Summary */}
      <Card title="Live Market Data" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Statistic
              title="Current Price"
              value={formatPrice(liveData.close)}
              valueStyle={{ fontSize: '20px', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="24h Change"
              value={formatPrice(liveData.change)}
              valueStyle={{ 
                color: liveData.change > 0 ? '#52c41a' : '#ff4d4f',
                fontSize: '18px'
              }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="24h Change %"
              value={formatPercentage(liveData.changePercent)}
              valueStyle={{ 
                color: liveData.changePercent > 0 ? '#52c41a' : '#ff4d4f',
                fontSize: '18px'
              }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Volume"
              value={liveData.volume ? (liveData.volume / 1000).toFixed(1) : 'N/A'}
              suffix="K"
              valueStyle={{ fontSize: '18px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Professional Trading Disclaimer */}
      <Alert
        message="Professional Trading System"
        description="This AI-powered trading analysis system provides real-time market intelligence and trading signals. Use proper risk management and position sizing. Past performance does not guarantee future results."
        type="info"
        showIcon
        icon={<BulbOutlined />}
      />
    </div>
  )
}

export default AIMarketAnalysis
