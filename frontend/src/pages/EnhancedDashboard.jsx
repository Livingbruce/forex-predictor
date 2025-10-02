import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Spin, Alert, Select, Button, Space, Typography, Progress, Tag, List, Tooltip } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DollarOutlined,
  TrophyOutlined,
  WarningOutlined,
  BarChartOutlined,
  RobotOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchSignalData, fetchHistoricalData } from '../services/apiService'
import SignalCard from '../components/SignalCard'
import IndicatorPanel from '../components/IndicatorPanel'
import NewsPanel from '../components/NewsPanel'
import AdvancedChart from '../components/AdvancedChart'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography

const EnhancedDashboard = ({ selectedPair }) => {
  const [signalData, setSignalData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [chartStyle, setChartStyle] = useState('line')
  const { isDarkMode, colors } = useTheme()

  // Fetch enhanced signal data
  const { data: signalResponse, isLoading: signalLoading, error: signalError } = useQuery({
    queryKey: ['enhanced-signal', selectedPair],
    queryFn: () => fetchSignalData(selectedPair),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  })

  // Fetch historical data for chart
  const { data: historicalResponse, isLoading: historicalLoading } = useQuery({
    queryKey: ['historical', selectedPair],
    queryFn: () => fetchHistoricalData(selectedPair, '1h', 100),
    refetchInterval: 60000, // Refetch every minute
  })

  useEffect(() => {
    if (signalResponse) {
      setSignalData(signalResponse)
    }
  }, [signalResponse])

  useEffect(() => {
    if (historicalResponse && Array.isArray(historicalResponse) && historicalResponse.length > 0) {
      const chartData = historicalResponse.map(candle => ({
        time: new Date(candle.time).getTime(),
        price: candle.close,
        volume: candle.volume,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
      setHistoricalData(chartData)
    } else {
      setHistoricalData([])
    }
  }, [historicalResponse])

  return (
    <div className="app-content">
      <div className="page-header">
        <Title level={3} style={{ color: '#fff' }}>🧠 Intelligent Forex Dashboard</Title>
        <Text type="secondary" style={{ color: '#8c8c8c' }}>
          Advanced AI-powered analysis and trading signals for {selectedPair}
        </Text>
      </div>

      {signalError && (
        <Alert
          message="Error"
          description={`Failed to fetch signal data: ${signalError.message}. Please check backend connection or API configuration.`}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {signalLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <span className="loading-text">Loading intelligent analysis...</span>
        </div>
      ) : (
        <>
          {/* Enhanced Intelligence Overview */}
          {signalData && signalData.modelWeights && (
            <Card 
              title={
                <Space>
                  <RobotOutlined style={{ color: '#1890ff' }} />
                  <span style={{ color: '#fff' }}>AI Intelligence Status</span>
                </Space>
              }
              headStyle={{ borderBottom: '1px solid #2a2a2a' }}
              style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>MODEL ACCURACY</div>
                    <Progress 
                      type="circle" 
                      percent={signalData.accuracy || 0} 
                      size={80}
                      strokeColor={{
                        '0%': '#ff4d4f',
                        '50%': '#faad14',
                        '100%': '#52c41a',
                      }}
                    />
                    <div style={{ color: colors.text, fontSize: '14px', marginTop: '8px' }}>
                      {signalData.accuracy || 0}% Accuracy
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>LEARNING DATA</div>
                    <div style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {signalData.learningData || 0}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      Data Points
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>PATTERNS DETECTED</div>
                    <div style={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {signalData.patterns?.length || 0}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      Active Patterns
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>AI CONFIDENCE</div>
                    <div style={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {signalData.signal?.confidence || 0}%
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      Signal Strength
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Enhanced Statistics Cards */}
          <Row gutter={[24, 24]} className="stats-grid" style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={8}>
              <div style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                height: '200px',
                minWidth: '220px',
                maxWidth: '280px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  marginRight: '8px'
                }}>
                  <DollarOutlined style={{ color: '#fff', fontSize: '20px' }} />
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  marginBottom: '8px', 
                  textTransform: 'uppercase'
                }}>
                  CURRENT PRICE
                </div>
                <div style={{ 
                  color: '#52c41a', 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  fontFamily: 'monospace', 
                  marginBottom: '8px'
                }}>
                  {signalData?.price ? `$${Number(signalData.price).toFixed(5)}` : '$0.00000'}
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px'
                }}>
                  Live Market Rate
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <div style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                height: '200px',
                minWidth: '220px',
                maxWidth: '280px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: signalData?.signal?.confidence > 70 ? 
                    'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' : 
                    'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  marginRight: '8px'
                }}>
                  {signalData?.signal?.confidence > 70 ? 
                    <ArrowUpOutlined style={{ color: '#fff', fontSize: '20px' }} /> :
                    <ArrowDownOutlined style={{ color: '#fff', fontSize: '20px' }} />
                  }
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  marginBottom: '8px', 
                  textTransform: 'uppercase'
                }}>
                  AI CONFIDENCE
                </div>
                <div style={{ 
                  color: signalData?.signal?.confidence > 70 ? '#52c41a' : '#ff4d4f', 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  fontFamily: 'monospace', 
                  marginBottom: '8px'
                }}>
                  {signalData?.signal?.confidence || 0}%
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px'
                }}>
                  {signalData?.signal?.confidence > 70 ? 'Strong Signal' : 'Weak Signal'}
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <div style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                height: '200px',
                minWidth: '220px',
                maxWidth: '280px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: (() => {
                    const rsi = signalData?.indicators?.rsi?.value || 50;
                    if (rsi < 30) return 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)';
                    if (rsi > 70) return 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)';
                    return 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)';
                  })(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  marginRight: '8px'
                }}>
                  <BarChartOutlined style={{ color: '#fff', fontSize: '20px' }} />
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  marginBottom: '8px', 
                  textTransform: 'uppercase'
                }}>
                  RSI (14)
                </div>
                <div style={{ 
                  color: (() => {
                    const rsi = signalData?.indicators?.rsi?.value || 50;
                    if (rsi < 30) return '#52c41a';
                    if (rsi > 70) return '#ff4d4f';
                    return '#13c2c2';
                  })(),
                  fontSize: '24px', 
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  marginBottom: '8px'
                }}>
                  {signalData?.indicators?.rsi?.value ? Number(signalData.indicators.rsi.value).toFixed(1) : '0.0'}
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px'
                }}>
                  {(() => {
                    const rsi = signalData?.indicators?.rsi?.value || 50;
                    if (rsi < 30) return 'Oversold';
                    if (rsi > 70) return 'Overbought';
                    return 'Neutral';
                  })()}
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <div style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                height: '200px',
                minWidth: '220px',
                maxWidth: '280px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: (() => {
                    const trend = signalData?.indicators?.trend?.direction || 'sideways';
                    if (trend === 'uptrend') return 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)';
                    if (trend === 'downtrend') return 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)';
                    return 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)';
                  })(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  marginRight: '8px'
                }}>
                  <TrophyOutlined style={{ color: '#fff', fontSize: '20px' }} />
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  marginBottom: '8px', 
                  textTransform: 'uppercase'
                }}>
                  MARKET TREND
                </div>
                <div style={{ 
                  color: (() => {
                    const trend = signalData?.indicators?.trend?.direction || 'sideways';
                    if (trend === 'uptrend') return '#52c41a';
                    if (trend === 'downtrend') return '#ff4d4f';
                    return '#fa8c16';
                  })(),
                  fontSize: '24px', 
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  marginBottom: '8px'
                }}>
                  {signalData?.indicators?.trend?.direction || 'Unknown'}
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '12px'
                }}>
                  AI Analysis
                </div>
              </div>
            </Col>
          </Row>

          {/* AI Pattern Detection */}
          {signalData && signalData.patterns && signalData.patterns.length > 0 && (
            <Card 
              title={
                <Space>
                  <RobotOutlined style={{ color: '#1890ff' }} />
                  <span style={{ color: '#fff' }}>AI Pattern Detection</span>
                </Space>
              }
              headStyle={{ borderBottom: '1px solid #2a2a2a' }}
              style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={signalData.patterns}
                renderItem={(pattern) => (
                  <List.Item style={{ borderBottom: '1px dashed #2a2a2a', padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: pattern.signal === 'BUY' ? 
                            'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' : 
                            'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <BulbOutlined style={{ color: '#fff', fontSize: '16px' }} />
                        </div>
                      }
                      title={
                        <Space>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{pattern.type}</Text>
                          <Tag color={pattern.signal === 'BUY' ? 'success' : 'error'}>{pattern.signal}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text style={{ color: '#8c8c8c' }}>
                            Confidence: <Text strong style={{ color: '#1890ff' }}>{pattern.confidence}%</Text>
                          </Text>
                          <Text style={{ color: '#8c8c8c' }}>
                            Strength: <Tag color="blue">{pattern.strength}</Tag>
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Main Content */}
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              {/* Advanced Chart with Multiple Types */}
              <div style={{ marginBottom: 16 }}>
                <Select
                  value={chartStyle}
                  onChange={setChartStyle}
                  style={{ width: 150, marginBottom: 16 }}
                  options={[
                    { value: 'line', label: 'Line Chart' },
                    { value: 'area', label: 'Area Chart' },
                    { value: 'bar', label: 'Bar Chart' },
                    { value: 'candlestick', label: 'Candlestick' },
                    { value: 'heikin-ashi', label: 'Heikin-Ashi' }
                  ]}
                />
                <AdvancedChart 
                  data={historicalData} 
                  selectedPair={selectedPair} 
                  chartStyle={chartStyle}
                />
              </div>

              {/* Enhanced News Panel */}
              <NewsPanel selectedPair={selectedPair} />
            </Col>

            <Col xs={24} lg={8}>
              {/* Enhanced Trading Signal */}
              {signalData && (
                <SignalCard 
                  signal={signalData.signal}
                  pair={selectedPair}
                  indicators={signalData.indicators}
                />
              )}

              {/* Enhanced Technical Indicators */}
              {signalData && (
                <IndicatorPanel indicators={signalData.indicators} />
              )}

              {/* AI Reasoning */}
              {signalData && signalData.reasoning && (
                <Card 
                  title={
                    <Space>
                      <RobotOutlined style={{ color: '#1890ff' }} />
                      <span style={{ color: '#fff' }}>AI Reasoning</span>
                    </Space>
                  }
                  headStyle={{ borderBottom: '1px solid #2a2a2a' }}
                  style={{ 
                    background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    marginTop: '16px'
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: '14px' }}>
                    {signalData.reasoning}
                  </Text>
                </Card>
              )}
            </Col>
          </Row>

          {/* Enhanced Model Weights */}
          {signalData && signalData.modelWeights && (
            <Card 
              title={
                <Space>
                  <ArrowUpOutlined style={{ color: '#1890ff' }} />
                  <span style={{ color: '#fff' }}>AI Model Weights</span>
                </Space>
              }
              headStyle={{ borderBottom: '1px solid #2a2a2a' }}
              style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                marginTop: '16px'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '8px' }}>TECHNICAL</div>
                    <Progress 
                      percent={Math.round(signalData.modelWeights.technical * 100)} 
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                    <div style={{ color: colors.text, fontSize: '14px', marginTop: '4px' }}>
                      {Math.round(signalData.modelWeights.technical * 100)}%
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '8px' }}>SENTIMENT</div>
                    <Progress 
                      percent={Math.round(signalData.modelWeights.sentiment * 100)} 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                    <div style={{ color: colors.text, fontSize: '14px', marginTop: '4px' }}>
                      {Math.round(signalData.modelWeights.sentiment * 100)}%
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '8px' }}>ECONOMIC</div>
                    <Progress 
                      percent={Math.round(signalData.modelWeights.economic * 100)} 
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                    <div style={{ color: colors.text, fontSize: '14px', marginTop: '4px' }}>
                      {Math.round(signalData.modelWeights.economic * 100)}%
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '8px' }}>VOLUME</div>
                    <Progress 
                      percent={Math.round(signalData.modelWeights.volume * 100)} 
                      strokeColor="#ff4d4f"
                      showInfo={false}
                    />
                    <div style={{ color: colors.text, fontSize: '14px', marginTop: '4px' }}>
                      {Math.round(signalData.modelWeights.volume * 100)}%
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default EnhancedDashboard
