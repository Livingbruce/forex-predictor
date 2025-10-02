import React, { useState, useEffect } from 'react'
import { Card, List, Tag, Typography, Space, Button, Tooltip, Alert, Timeline, Progress } from 'antd'
import { 
  ClockCircleOutlined, 
  ThunderboltOutlined, 
  CalendarOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'

const { Title, Text } = Typography

const EntryTimingPanel = ({ selectedPair }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Fetch timing analysis
  const { data: timingData, isLoading: timingLoading, error: timingError, refetch: refetchTiming } = useQuery({
    queryKey: ['timing', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/timing/${encodeURIComponent(selectedPair)}`)
      .then(res => res.json()),
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  })

  const getSessionColor = (session) => {
    switch (session) {
      case 'London':
        return '#1890ff'
      case 'New York':
        return '#52c41a'
      case 'Tokyo':
        return '#faad14'
      case 'Sydney':
        return '#722ed1'
      default:
        return '#8c8c8c'
    }
  }

  const getVolatilityColor = (volatility) => {
    switch (volatility) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'green'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'red'
      case 'Medium':
        return 'orange'
      case 'Low':
        return 'green'
      default:
        return 'default'
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    const date = new Date(timeString)
    return date.toLocaleString()
  }

  const getTimeUntilNext = (nextTime) => {
    if (!nextTime) return 'N/A'
    const now = new Date()
    const next = new Date(nextTime)
    const diffMs = next - now
    
    if (diffMs <= 0) return 'Now'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`
    } else {
      return `${diffMins}m`
    }
  }

  if (timingError) {
    return (
      <Alert
        message="Error Loading Timing Data"
        description="Failed to load entry timing analysis"
        type="error"
        showIcon
      />
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Current Market Status */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            Market Timing Analysis
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Tooltip title="Entry timing analysis based on market sessions and volatility">
              <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
            <ReloadOutlined 
              onClick={() => refetchTiming()} 
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
          </Space>
        }
      >
        {timingLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ marginBottom: 8 }}>Analyzing market timing...</div>
          </div>
        ) : timingData && timingData.timingAnalysis ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <Text strong>Current Time: {currentTime.toLocaleString()}</Text>
              </Space>
              <Tag color={getSessionColor(timingData.timingAnalysis.currentSession)}>
                {timingData.timingAnalysis.currentSession} Session
              </Tag>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text>Market Volatility:</Text>
                <Tag color={getVolatilityColor(timingData.timingAnalysis.volatility)}>
                  {timingData.timingAnalysis.volatility.toUpperCase()}
                </Tag>
              </div>
              <Progress 
                percent={timingData.timingAnalysis.confidence} 
                strokeColor={timingData.timingAnalysis.confidence > 70 ? '#52c41a' : timingData.timingAnalysis.confidence > 50 ? '#faad14' : '#ff4d4f'}
                showInfo={true}
                format={(percent) => `${percent}% Timing Confidence`}
              />
            </div>
            
            {timingData.timingAnalysis.entryWindow && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Entry Window:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    {formatTime(timingData.timingAnalysis.entryWindow.start)} - {formatTime(timingData.timingAnalysis.entryWindow.end)}
                  </Text>
                  <Tag color={getVolatilityColor(timingData.timingAnalysis.entryWindow.urgency.toLowerCase())} style={{ marginLeft: 8 }}>
                    {timingData.timingAnalysis.entryWindow.urgency} Urgency
                  </Tag>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Card>

      {/* Timing Recommendations */}
      <Card 
        title={
          <Space>
            <ThunderboltOutlined />
            Entry Recommendations
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {timingLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ marginBottom: 8 }}>Loading recommendations...</div>
          </div>
        ) : timingData && timingData.timingAnalysis && timingData.timingAnalysis.recommendations ? (
          <Timeline>
            {timingData.timingAnalysis.recommendations.map((rec, index) => (
              <Timeline.Item
                key={index}
                dot={
                  rec.type === 'Immediate' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                  rec.type === 'Wait' ? <ExclamationCircleOutlined style={{ color: '#faad14' }} /> :
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                }
                color={getPriorityColor(rec.priority)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text strong>{rec.type} Entry</Text>
                    <Tag color={getPriorityColor(rec.priority)}>
                      {rec.priority} Priority
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">Time: {rec.time}</Text>
                  </div>
                  <div>
                    <Text>{rec.reason}</Text>
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No timing recommendations</div>
            <div style={{ fontSize: '12px' }}>Market may be closed or no optimal timing detected</div>
          </div>
        )}
      </Card>

      {/* Market Hours */}
      <Card 
        title="Market Hours"
        size="small"
      >
        {timingData && timingData.timingAnalysis && timingData.timingAnalysis.marketHours ? (
          <List
            size="small"
            dataSource={timingData.timingAnalysis.marketHours}
            renderItem={(session) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={getSessionColor(session.name)}>
                        {session.name}
                      </Tag>
                      <Text strong>{session.hours}</Text>
                    </Space>
                  }
                  description={
                    <Text type="secondary">{session.timezone}</Text>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
            <div style={{ fontSize: '12px' }}>Market hours information not available</div>
          </div>
        )}
      </Card>

      {/* Next Best Time */}
      {timingData && timingData.timingAnalysis && timingData.timingAnalysis.nextBestTime && (
        <Card 
          title="Next Optimal Entry"
          size="small"
          style={{ marginTop: 16 }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              {formatTime(timingData.timingAnalysis.nextBestTime)}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              In {getTimeUntilNext(timingData.timingAnalysis.nextBestTime)}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EntryTimingPanel
