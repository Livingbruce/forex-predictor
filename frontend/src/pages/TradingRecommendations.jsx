import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Alert, 
  Spin, 
  Typography, 
  Space, 
  Tag, 
  Progress, 
  Divider,
  Select,
  Tooltip,
  Badge,
  Switch
} from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  PauseCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTradingRecommendation } from '../services/apiService'

const { Title, Text } = Typography

const TradingRecommendations = ({ selectedPair = 'EUR/USD' }) => {
  const [timezone, setTimezone] = useState(() => {
    // Load from localStorage or default to UTC
    return localStorage.getItem('timezone') || 'UTC'
  })
  const [backendStatus, setBackendStatus] = useState('checking')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  const queryClient = useQueryClient()

  // Get user's timezone automatically and save to localStorage
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(userTimezone)
    localStorage.setItem('timezone', userTimezone)
  }, [])

  // Save timezone to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timezone', timezone)
  }, [timezone])

  const { data: tradingData, isLoading, error, refetch } = useQuery({
    queryKey: ['tradingRecommendation', selectedPair, timezone],
    queryFn: () => fetchTradingRecommendation(selectedPair, timezone),
    refetchInterval: autoRefresh ? 1000 : false, // Auto-refresh every 1 second when enabled
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true, // Continue refreshing even when tab is not active
  })

  // Enhanced auto-refresh with data change detection
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      try {
        // Check if there's new data available
        const newData = await fetchTradingRecommendation(selectedPair, timezone)
        
        // Only update if data has actually changed
        if (tradingData && newData) {
          const hasChanged = 
            tradingData.recommendation.signal !== newData.recommendation.signal ||
            tradingData.recommendation.confidence !== newData.recommendation.confidence ||
            Math.abs(tradingData.marketAnalysis.currentPrice - newData.marketAnalysis.currentPrice) > 0.0001 ||
            Math.abs(tradingData.marketAnalysis.priceChangePercent - newData.marketAnalysis.priceChangePercent) > 0.001

          if (hasChanged) {
            // Invalidate and refetch the query
            queryClient.invalidateQueries(['tradingRecommendation', selectedPair, timezone])
            setLastUpdateTime(new Date().toLocaleTimeString())
            
            // Silent update - no notifications
          }
        }
      } catch (error) {
        console.warn('Auto-refresh check failed:', error)
      }
    }, 5000) // Check every 5 seconds for changes

    return () => clearInterval(interval)
  }, [autoRefresh, selectedPair, timezone, tradingData, queryClient])

  // Update backend status
  useEffect(() => {
    if (error) {
      setBackendStatus('offline')
    } else if (tradingData) {
      setBackendStatus('online')
    }
  }, [tradingData, error])

  // Force refresh function
  const handleForceRefresh = async () => {
    await refetch()
    setLastUpdateTime(new Date().toLocaleTimeString())
  }

  // Toggle auto-refresh
  const handleAutoRefreshToggle = (checked) => {
    setAutoRefresh(checked)
    if (checked) {
      // Force immediate refresh when enabling auto-refresh
      handleForceRefresh()
    }
  }

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY':
        return <ArrowUpOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
      case 'SELL':
        return <ArrowDownOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
      case 'HOLD':
        return <PauseCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
      default:
        return <PauseCircleOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
    }
  }

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return '#52c41a'
      case 'SELL':
        return '#ff4d4f'
      case 'HOLD':
        return '#faad14'
      default:
        return '#8c8c8c'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return '#52c41a'
    if (confidence >= 50) return '#faad14'
    return '#ff4d4f'
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 70) return 'High Confidence'
    if (confidence >= 50) return 'Medium Confidence'
    return 'Low Confidence'
  }

  const handleRefresh = () => {
    refetch()
  }

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (IST)' }
  ]

  return (
    <div className="app-content">
      <div className="page-header">
        <Title level={2}>AI Trading Recommendations</Title>
        <Text type="secondary">
          Intelligent BUY/SELL signals with detailed analysis for {selectedPair}
        </Text>
      </div>

      {/* Timezone Selector & Auto-Refresh Controls */}
      <Card style={{ marginBottom: 20, borderRadius: '12px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Space align="center">
              <GlobalOutlined style={{ color: '#1890ff' }} />
              <Text strong>Your Timezone:</Text>
              <Select
                value={timezone}
                onChange={setTimezone}
                style={{ width: 200 }}
                options={timezoneOptions}
              />
              <Text type="secondary">
                Current Time: {tradingData?.recommendation?.userTime || 'Loading...'}
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Space align="center" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Space align="center">
                <SyncOutlined style={{ color: autoRefresh ? '#52c41a' : '#8c8c8c' }} />
                <Text strong>Auto-Refresh:</Text>
                <Switch
                  checked={autoRefresh}
                  onChange={handleAutoRefreshToggle}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Space>
              <Button
                type="primary"
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleForceRefresh}
                loading={isLoading}
                style={{ marginLeft: '16px' }}
              >
                Refresh Now
              </Button>
              {lastUpdateTime && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Last updated: {lastUpdateTime}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Backend Status Alert */}
      {backendStatus === 'offline' && (
        <Alert
          message="Backend Offline"
          description="AI trading recommendations are currently unavailable. Please check your connection and try again."
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
          message="Data Loading Error"
          description="Unable to fetch trading recommendations. Please try again."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
          action={
            <Button size="small" onClick={handleRefresh}>
              Refresh
            </Button>
          }
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#8c8c8c' }}>
            Analyzing market conditions...
          </div>
        </div>
      )}

      {/* Main Trading Recommendation */}
      {tradingData && !isLoading && (
        <>
          
          {/* Core Recommendation Card */}
          <Card 
            style={{ 
              marginBottom: 24,
              borderRadius: '12px',
              border: `2px solid ${getSignalColor(tradingData.recommendation.signal)}`
            }}
            styles={{
              body: { 
                padding: '24px',
                background: `linear-gradient(135deg, ${getSignalColor(tradingData.recommendation.signal)}10 0%, transparent 100%)`
              }
            }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  {getSignalIcon(tradingData.recommendation.signal)}
                  <div style={{ marginTop: '12px' }}>
                    <Title level={1} style={{ 
                      color: getSignalColor(tradingData.recommendation.signal),
                      margin: 0,
                      fontSize: '48px'
                    }}>
                      {tradingData.recommendation.signal}
                    </Title>
                    <Text style={{ 
                      fontSize: '18px',
                      color: getSignalColor(tradingData.recommendation.signal),
                      fontWeight: 'bold'
                    }}>
                      {tradingData.recommendation.signal === 'BUY' ? 'ENTER LONG POSITION' : 
                       tradingData.recommendation.signal === 'SELL' ? 'ENTER SHORT POSITION' : 
                       'WAIT FOR BETTER OPPORTUNITY'}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={16}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Confidence Level */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text strong>AI Confidence Level</Text>
                      <Text strong style={{ color: getConfidenceColor(tradingData.recommendation.confidence) }}>
                        {tradingData.recommendation.confidence}% - {getConfidenceText(tradingData.recommendation.confidence)}
                      </Text>
                    </div>
                    <Progress 
                      percent={tradingData.recommendation.confidence} 
                      strokeColor={getConfidenceColor(tradingData.recommendation.confidence)}
                      showInfo={false}
                    />
                  </div>

                  {/* AI Explanation */}
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                      <InfoCircleOutlined style={{ marginRight: '8px' }} />
                      AI Analysis & Explanation:
                    </Text>
                    <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {tradingData.recommendation.explanation}
                    </Text>
                  </div>

                  {/* Market Analysis */}
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Current Price"
                        value={tradingData.marketAnalysis.currentPrice}
                        precision={5}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Price Change"
                        value={tradingData.marketAnalysis.priceChangePercent}
                        precision={2}
                        suffix="%"
                        valueStyle={{ 
                          color: tradingData.marketAnalysis.priceChangePercent >= 0 ? '#52c41a' : '#ff4d4f' 
                        }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Market Session"
                        value={tradingData.marketAnalysis.session}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Volatility"
                        value={tradingData.marketAnalysis.volatility}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Trading Details */}
          {tradingData.recommendation.signal !== 'HOLD' && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Trading Parameters</span>
                    </Space>
                  }
                  style={{ borderRadius: '12px' }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Entry Price:</Text>
                      <Text style={{ marginLeft: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                        {tradingData.recommendation.entryPrice}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Stop Loss:</Text>
                      <Text style={{ marginLeft: '8px', fontSize: '16px', color: '#ff4d4f' }}>
                        {tradingData.recommendation.stopLoss}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Take Profit:</Text>
                      <Text style={{ marginLeft: '8px', fontSize: '16px', color: '#52c41a' }}>
                        {tradingData.recommendation.takeProfit}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Risk/Reward Ratio:</Text>
                      <Text style={{ marginLeft: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                        1:{tradingData.recommendation.riskRewardRatio}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <span>Trading Sessions ({timezone})</span>
                    </Space>
                  }
                  style={{ borderRadius: '12px' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {tradingData.recommendation.nextOptimalTimes.map((session, index) => (
                      <div key={index} style={{ 
                        padding: '12px',
                        borderRadius: '8px',
                        background: session.isActive ? '#1890ff20' : '#f5f5f5',
                        border: session.isActive ? '1px solid #1890ff' : '1px solid #d9d9d9'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <Text strong>{session.session}</Text>
                            {session.isActive && (
                              <Badge status="processing" text="Active" />
                            )}
                          </Space>
                          <Text type="secondary">
                            {session.startTime} - {session.endTime}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          )}

          {/* Refresh Button */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button 
              type="primary" 
              size="large" 
              onClick={handleForceRefresh}
              loading={isLoading}
              style={{ borderRadius: '8px' }}
            >
              <ThunderboltOutlined />
              Refresh AI Analysis
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default TradingRecommendations
