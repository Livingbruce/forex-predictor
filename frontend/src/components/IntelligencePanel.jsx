import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Progress, Statistic, Spin, Typography } from 'antd'
import { RobotOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const IntelligencePanel = ({ 
  selectedPair = 'EUR/USD', 
  signalResponse, 
  signalsLoading, 
  signalsError, 
  backendStatus, 
  setBackendStatus 
}) => {
  const [intelligenceMetrics, setIntelligenceMetrics] = useState(null)

  // Debug: Component mount
  console.log('🧠 IntelligencePanel mounted for pair:', selectedPair)

  // Update backend status based on query results
  useEffect(() => {
    if (signalsError) {
      console.log('🧠 Setting backend status to offline due to error:', signalsError)
      setBackendStatus('offline')
    } else if (signalResponse) {
      console.log('🧠 Setting backend status to online due to successful data fetch')
      setBackendStatus('online')
    }
  }, [signalResponse, signalsError])

  // Update state when data changes
  useEffect(() => {
    if (!signalResponse) return // Skip if not ready yet
    
    if (signalResponse?.intelligence && typeof signalResponse.intelligence === 'object') {
      console.log('🧠 Intelligence data received:', signalResponse.intelligence)
      setIntelligenceMetrics(signalResponse.intelligence)
    }
  }, [signalResponse])

  // Debug: Log current state
  console.log('📊 IntelligencePanel State:', {
    intelligenceMetrics,
    signalsLoading,
    signalsError,
    backendStatus
  })

  if (signalsError) {
    return (
      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          marginBottom: 24
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
          <RobotOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
          <Title level={4} style={{ color: '#ff4d4f', margin: 0 }}>
            Intelligence Error
          </Title>
          <Text style={{ color: '#8c8c8c' }}>
            Failed to load intelligence metrics: {signalsError.message}
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        marginBottom: 24
      }}
      styles={{ body: { padding: '20px' } }}
    >
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} sm={8}>
          <div style={{ textAlign: 'center' }}>
            <RobotOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              AI Intelligence
            </Title>
            <Progress
              type="circle"
              percent={intelligenceMetrics && typeof intelligenceMetrics.accuracy === 'number' ? parseFloat(intelligenceMetrics.accuracy.toFixed(2)) || 0 : 0}
              strokeColor="#1890ff"
              trailColor="#2a2a2a"
              size={80}
              format={(percent) => `${percent}%`}
            />
            {signalsLoading && (
              <div style={{ marginTop: '12px' }}>
                <Spin size="small" />
                <Text style={{ color: '#8c8c8c', fontSize: '12px', marginLeft: '8px' }}>
                  Loading intelligence...
                </Text>
              </div>
            )}
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Total Trades</span>}
              value={intelligenceMetrics?.totalTrades || 0}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
            <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
              Successful: {intelligenceMetrics?.successfulTrades || 0}
            </Text>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ textAlign: 'center' }}>
            <FireOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Win Rate</span>}
              value={intelligenceMetrics && intelligenceMetrics.successfulTrades && intelligenceMetrics.totalTrades && intelligenceMetrics.totalTrades > 0 ? 
                ((intelligenceMetrics.successfulTrades / intelligenceMetrics.totalTrades) * 100).toFixed(1) : 
                0
              }
              suffix="%"
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
            <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
              Last Updated: {intelligenceMetrics?.lastUpdated ? 
                new Date(intelligenceMetrics.lastUpdated).toLocaleTimeString() : 
                'Never'
              }
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default React.memo(IntelligencePanel)
