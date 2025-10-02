import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, Typography, Timeline, Tag } from 'antd'
import { ClockCircleOutlined, GlobalOutlined, CalendarOutlined } from '@ant-design/icons'
import { getVolatilityColor, getSessionColor } from '../utils/colorUtils'

const { Title, Text } = Typography

const SessionPanel = ({ 
  selectedPair = 'EUR/USD', 
  timingResponse, 
  timingLoading, 
  timingError, 
  backendStatus, 
  setBackendStatus 
}) => {
  const [timingData, setTimingData] = useState(null)

  // Debug: Component mount
  console.log('⏰ SessionPanel mounted for pair:', selectedPair)

  // Update backend status based on query results
  useEffect(() => {
    if (timingError) {
      console.error('❌ Timing analysis fetch failed:', timingError)
      setBackendStatus('offline')
    } else if (timingResponse) {
      console.log('✅ Timing analysis fetched successfully:', timingResponse)
      setBackendStatus('online')
    }
  }, [timingResponse, timingError])

  // Update state when data changes
  useEffect(() => {
    if (!timingResponse) return // Skip if not ready yet
    
    if (timingResponse && typeof timingResponse === 'object') {
      console.log('⏰ Timing data received:', timingResponse)
      setTimingData(timingResponse)
    }
  }, [timingResponse])

  // Debug: Log current state
  console.log('📊 SessionPanel State:', {
    timingData,
    timingLoading,
    timingError,
    backendStatus
  })

  // Helper functions for styling
  const getSessionColor = (session) => {
    if (!session) return '#8c8c8c'
    switch (session.toLowerCase()) {
      case 'london': return '#1890ff'
      case 'new york': return '#52c41a'
      case 'tokyo': return '#faad14'
      case 'sydney': return '#722ed1'
      default: return '#8c8c8c'
    }
  }

  const getSessionIcon = (session) => {
    if (!session || typeof session !== 'string') return <GlobalOutlined />
    switch (session.toLowerCase()) {
      case 'london': return <ClockCircleOutlined />
      case 'new york': return <GlobalOutlined />
      case 'tokyo': return <CalendarOutlined />
      case 'sydney': return <GlobalOutlined />
      default: return <GlobalOutlined />
    }
  }

  const getTimingColor = (timing) => {
    if (!timing || typeof timing !== 'string') return '#8c8c8c'
    switch (timing.toLowerCase()) {
      case 'optimal': return '#52c41a'
      case 'good': return '#1890ff'
      case 'poor': return '#ff4d4f'
      default: return '#8c8c8c'
    }
  }

  if (timingError) {
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
          <ClockCircleOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
          <Title level={4} style={{ color: '#ff4d4f', margin: 0 }}>
            Session Error
          </Title>
          <Text style={{ color: '#8c8c8c' }}>
            Failed to load session data: {timingError.message}
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={12}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          styles={{ body: { padding: '20px' } }}
        >
          <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
            <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Market Sessions
          </Title>
          
          {timingLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <Text style={{ color: '#8c8c8c', marginLeft: '8px' }}>
                Loading session data...
              </Text>
            </div>
          ) : timingData?.timingAnalysis?.marketHours ? (
            <Timeline
              items={timingData.timingAnalysis.marketHours.map((session, index) => ({
                key: index,
                dot: getSessionIcon(session.name),
                children: (
                  <div>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {session.name}
                    </Text>
                    <br />
                    <Text style={{ color: '#8c8c8c' }}>
                      {session.start} - {session.end} GMT
                    </Text>
                    <br />
                    <Tag color={getSessionColor(session.name)}>
                      {session.status}
                    </Tag>
                  </div>
                )
              }))}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text style={{ color: '#8c8c8c' }}>
                No session data available
              </Text>
            </div>
          )}
        </Card>
      </Col>
      
      <Col xs={24} lg={12}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          styles={{ body: { padding: '20px' } }}
        >
          <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
            <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            Trading Opportunities
          </Title>
          
          {timingLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <Text style={{ color: '#8c8c8c', marginLeft: '8px' }}>
                Loading opportunities...
              </Text>
            </div>
          ) : timingData?.timingAnalysis ? (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: '#8c8c8c' }}>Current Session</span>}
                    value={timingData.timingAnalysis.currentSession || 'Unknown'}
                    valueStyle={{ 
                      color: getSessionColor(timingData.timingAnalysis?.currentSession || 'Unknown'),
                      fontSize: '16px'
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: '#8c8c8c' }}>Volatility</span>}
                    value={timingData.timingAnalysis.volatility || 'Unknown'}
                    valueStyle={{ 
                      color: getVolatilityColor(timingData.timingAnalysis?.volatility || 'Unknown'),
                      fontSize: '16px'
                    }}
                  />
                </Col>
              </Row>
              
              <div style={{ marginTop: '16px' }}>
                <Text style={{ color: '#8c8c8c' }}>Recommendation:</Text>
                <br />
                <Tag color={getTimingColor(timingData.timingAnalysis.recommendation)}>
                  {timingData.timingAnalysis.recommendation || 'Unknown'}
                </Tag>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <Text style={{ color: '#8c8c8c' }}>Next Optimal Time:</Text>
                <br />
                <Text style={{ color: '#1890ff' }}>
                  {timingData.timingAnalysis.nextOptimalTime || 'Calculating...'}
                </Text>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text style={{ color: '#8c8c8c' }}>
                No timing data available
              </Text>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  )
}

export default React.memo(SessionPanel)
