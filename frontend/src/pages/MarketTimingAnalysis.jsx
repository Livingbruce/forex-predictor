import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Spin, Alert, Button, Space, Tooltip, Tag, List, Progress, Statistic, Timeline } from 'antd'
import { 
  ClockCircleOutlined, 
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined, 
  InfoCircleOutlined,
  ReloadOutlined,
  FireOutlined,
  GlobalOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchTimingAnalysis } from '../services/apiService'

const { Title, Text } = Typography

const MarketTimingAnalysisPage = ({ selectedPair }) => {
  const [backendStatus, setBackendStatus] = useState('checking')
  
  const { data: timingData, isLoading, error, refetch } = useQuery({
    queryKey: ['timingAnalysis', selectedPair],
    queryFn: () => fetchTimingAnalysis(selectedPair),
    refetchInterval: 10000, // Quiet auto-refresh every 10 seconds
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  // Update backend status based on query results
  useEffect(() => {
    if (error) {
      setBackendStatus('offline')
    } else if (timingData) {
      setBackendStatus('online')
    }
  }, [timingData, error])

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/health')
        if (response.ok) {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      } catch (error) {
        setBackendStatus('offline')
      }
    }
    
    checkBackend()
    const interval = setInterval(checkBackend, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Helper functions with defensive checks
  const getSessionColor = (session) => {
    if (!session || typeof session !== 'string') return '#8c8c8c'
    switch (session.toLowerCase()) {
      case 'sydney':
        return '#52c41a'
      case 'tokyo':
        return '#1890ff'
      case 'london':
        return '#faad14'
      case 'new york':
        return '#ff4d4f'
      default:
        return '#8c8c8c'
    }
  }

  const getSessionIcon = (session) => {
    if (!session || typeof session !== 'string') return <ClockCircleOutlined />
    switch (session.toLowerCase()) {
      case 'sydney':
        return <GlobalOutlined />
      case 'tokyo':
        return <GlobalOutlined />
      case 'london':
        return <GlobalOutlined />
      case 'new york':
        return <GlobalOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  const getVolatilityColor = (level) => {
    if (!level || typeof level !== 'string') return '#8c8c8c'
    switch (level.toLowerCase()) {
      case 'high':
        return '#ff4d4f'
      case 'medium':
        return '#faad14'
      case 'low':
        return '#52c41a'
      default:
        return '#8c8c8c'
    }
  }

  const getTimingColor = (timing) => {
    if (!timing || typeof timing !== 'string') return '#8c8c8c'
    switch (timing.toLowerCase()) {
      case 'optimal entry':
        return '#52c41a' // Green - best timing
      case 'good entry':
        return '#1890ff' // Blue - good timing
      case 'moderate entry':
        return '#faad14' // Orange - moderate timing
      case 'early entry':
        return '#722ed1' // Purple - early but okay
      case 'wait for volatility':
        return '#fa8c16' // Orange - wait for better conditions
      case 'wait for tokyo':
        return '#faad14' // Orange - wait for next session
      case 'wait for london':
        return '#faad14' // Orange - wait for major session
      case 'wait for better timing':
        return '#ff4d4f' // Red - not good timing
      case 'optimal':
        return '#52c41a'
      case 'good':
        return '#1890ff'
      case 'fair':
        return '#faad14'
      case 'poor':
        return '#ff4d4f'
      default:
        return '#8c8c8c'
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <Title level={2}>Market Timing Analysis</Title>
        <Text type="secondary">
          Real-time market session analysis and optimal entry timing for {selectedPair}
        </Text>
      </div>

      {/* Backend Status Alert */}
      {backendStatus === 'offline' && (
        <Alert
          message="Backend Offline"
          description="Live market timing data is currently unavailable. Please check your connection and try again."
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Error Alert */}
      {error && backendStatus === 'online' && (
        <Alert
          message="Error"
          description={`Failed to fetch timing analysis: ${error.message}`}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Loading State */}
      {(isLoading || backendStatus === 'checking') ? (
        <div className="loading-container">
          <Spin size="large" />
          <span className="loading-text">
            {backendStatus === 'checking' ? 'Checking backend connection...' : 'Loading market timing analysis...'}
          </span>
        </div>
      ) : (
        <>
          {/* Current Market Status */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card 
                style={{ 
                  borderRadius: '12px'
                }}
                styles={{ body: { padding: '20px', textAlign: 'center' } }}
              >
                <ClockCircleOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Active Session</span>}
                  value={timingData?.timingAnalysis?.currentSession || 'Unknown'}
                  valueStyle={{ 
                    color: getSessionColor(timingData?.timingAnalysis?.currentSession || ''),
                    fontSize: '20px',
                    textTransform: 'capitalize'
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={8}>
              <Card 
                style={{ 
                  borderRadius: '12px'
                }}
                styles={{ body: { padding: '20px', textAlign: 'center' } }}
              >
                <ThunderboltOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Volatility Level</span>}
                  value={timingData?.timingAnalysis?.volatility || 'Unknown'}
                  valueStyle={{ 
                    color: getVolatilityColor(timingData?.timingAnalysis?.volatility || ''),
                    fontSize: '20px',
                    textTransform: 'capitalize'
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={8}>
              <Card 
                style={{ 
                  borderRadius: '12px'
                }}
                styles={{ body: { padding: '20px', textAlign: 'center' } }}
              >
                <FireOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Entry Timing</span>}
                  value={timingData?.timingAnalysis?.recommendation || 'Unknown'}
                  valueStyle={{ 
                    color: getTimingColor(timingData?.timingAnalysis?.recommendation || ''),
                    fontSize: '20px',
                    textTransform: 'capitalize'
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Market Sessions Timeline */}
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>Market Sessions Timeline</span>
              </Space>
            }
            extra={
              <Space>
                <Tooltip title="Market Session Information">
                  <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                </Tooltip>
                <Tooltip title="Refresh Timing Analysis">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh} 
                    type="text" 
                    style={{ color: '#fff' }}
                  />
                </Tooltip>
              </Space>
            }
            style={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              marginBottom: 24
            }}
            styles={{
              header: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderBottom: '1px solid #2a2a2a',
                color: '#fff'
              },
              body: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                padding: '20px'
              }
            }}
          >
            {timingData?.timingAnalysis?.marketHours?.length > 0 ? (
            <Timeline
                items={timingData.timingAnalysis.marketHours.map(session => ({
                color: session.isActive ? getSessionColor(session.session || session.name) : '#8c8c8c',
                children: (
                  <div style={{ 
                    background: session.isActive ? `${getSessionColor(session.session || session.name)}20` : '#0e0e0e',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: session.isActive ? `1px solid ${getSessionColor(session.session || session.name)}` : '1px solid #2a2a2a'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ 
                        color: getSessionColor(session.session || session.name), 
                        marginRight: '8px',
                        fontSize: '16px'
                      }}>
                        {getSessionIcon(session.session || session.name)}
                      </div>
                      <Text strong style={{ 
                        color: session.isActive ? '#fff' : '#8c8c8c',
                        fontSize: '16px',
                        textTransform: 'capitalize'
                      }}>
                        {session.session || session.name} Session
                      </Text>
                      {session.isActive && (
                        <Tag color={getSessionColor(session.session || session.name)} style={{ marginLeft: '8px' }}>
                          Active
                        </Tag>
                      )}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                      <div>Hours: {session.start} - {session.end}</div>
                        <div>Timezone: {session.timezone}</div>
                      </div>
                  </div>
                )
                }))}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>No market session data available</div>
                <div style={{ fontSize: '12px' }}>
                  {backendStatus === 'offline' 
                    ? 'Backend is offline - market session data unavailable'
                    : 'Market session timeline will be displayed here when data is available'
                  }
                </div>
              </div>
            )}
          </Card>

          {/* Entry Timing Recommendations */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                    <span>Optimal Entry Windows</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px'
                }}
                headStyle={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  borderBottom: '1px solid #2a2a2a',
                  color: '#fff'
                }}
                bodyStyle={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  padding: '20px'
                }}
              >
                {timingData?.timingAnalysis?.recommendations?.length > 0 ? (
                  <List
                    dataSource={timingData.timingAnalysis.recommendations}
                    renderItem={recommendation => (
                      <List.Item style={{ 
                        borderBottom: '1px dashed #2a2a2a', 
                        padding: '12px 0'
                      }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <Text strong style={{ color: '#fff', fontSize: '16px', marginRight: '8px' }}>
                              {recommendation.type}
                            </Text>
                            <Tag color={getTimingColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Tag>
                          </div>
                          <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                            {recommendation.reason}
                          </Text>
                          <div style={{ marginTop: '8px' }}>
                            <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              Time: <span style={{ color: getTimingColor(recommendation.priority) }}>
                                {recommendation.time}
                              </span>
                            </Text>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                    <ArrowUpOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>No entry windows available</div>
                    <div style={{ fontSize: '12px' }}>
                      {backendStatus === 'offline' 
                        ? 'Backend is offline - entry timing data unavailable'
                        : 'Optimal entry windows will be displayed here when data is available'
                      }
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <span>Next Trading Opportunities</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px'
                }}
                headStyle={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  borderBottom: '1px solid #2a2a2a',
                  color: '#fff'
                }}
                bodyStyle={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  padding: '20px'
                }}
              >
                <div style={{ 
                  background: '#0e0e0e', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  marginBottom: '16px'
                }}>
                  <Title level={5} style={{ color: '#fff', marginBottom: '12px' }}>Next Optimal Time</Title>
                  <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: '600' }}>
                    {timingData?.timingAnalysis?.nextOptimalTime || 'Calculating...'}
                  </Text>
                </div>

                <div style={{ 
                  background: '#0e0e0e', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  marginBottom: '16px'
                }}>
                  <Title level={5} style={{ color: '#fff', marginBottom: '12px' }}>Next Trading Day</Title>
                  <Text style={{ color: '#1890ff', fontSize: '16px', fontWeight: '600' }}>
                    {timingData?.timingAnalysis?.nextTradingDay || 'Calculating...'}
                  </Text>
                </div>

                <div style={{ 
                  background: '#0e0e0e', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a'
                }}>
                  <Title level={5} style={{ color: '#fff', marginBottom: '12px' }}>Market Status</Title>
                  <div style={{ color: '#8c8c8c', fontSize: '14px', lineHeight: '1.6' }}>
                    {timingData?.timingAnalysis?.marketStatus || 
                     (backendStatus === 'offline' 
                       ? 'Backend is offline - market status unavailable'
                       : 'Market status information will be displayed here when available'
                     )}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default MarketTimingAnalysisPage
