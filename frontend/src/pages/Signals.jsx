import React, { useState } from 'react'
import { Card, Select, Button, Table, Tag, Space, Row, Col, Statistic, Alert, Typography, Badge } from 'antd'
import { ReloadOutlined, EyeOutlined, ClockCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchSignalHistory, fetchSignalData } from '../services/apiService'

const { Option } = Select
const { Title, Text } = Typography

const Signals = ({ selectedPair: propSelectedPair = 'EUR/USD' }) => {
  const [selectedPair, setSelectedPair] = useState(propSelectedPair)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')

  // Update local state when prop changes
  React.useEffect(() => {
    setSelectedPair(propSelectedPair)
  }, [propSelectedPair])

  const { data: signalHistory, isLoading, refetch } = useQuery({
    queryKey: ['signalHistory', selectedPair, selectedTimeframe],
    queryFn: () => fetchSignalHistory(selectedPair, selectedTimeframe, 50),
    refetchInterval: 10000, // Quiet auto-refresh every 10 seconds
    refetchIntervalInBackground: true,
  })

  // Real-time signals for today
  const { data: realTimeSignal, isLoading: realTimeLoading, refetch: refetchRealTime } = useQuery({
    queryKey: ['realTimeSignal', selectedPair],
    queryFn: () => fetchSignalData(selectedPair),
    refetchInterval: 1000, // Auto-update every 1 second
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  const handleRefresh = async () => {
    try {
      await fetchSignalData(selectedPair, selectedTimeframe)
      refetch()
    } catch (error) {
      console.error('Failed to refresh signal:', error)
    }
  }

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
      width: 150,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price.toFixed(5),
      width: 100,
    },
    {
      title: 'Signal',
      dataIndex: 'signal',
      key: 'signal',
      render: (signal) => {
        const colors = {
          BUY: 'green',
          SELL: 'red',
          HOLD: 'orange'
        }
        return <Tag color={colors[signal]}>{signal}</Tag>
      },
      width: 80,
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => `${confidence}%`,
      width: 100,
    },
    {
      title: 'Volatility',
      dataIndex: 'volatility',
      key: 'volatility',
      render: (volatility) => {
        const colors = {
          Low: 'green',
          Medium: 'orange',
          High: 'red'
        }
        return <Tag color={colors[volatility]}>{volatility}</Tag>
      },
      width: 100,
    },
  ]

  const getSignalStats = () => {
    if (!signalHistory?.data) return null

    const signals = signalHistory.data
    const buySignals = signals.filter(s => s.signal === 'BUY').length
    const sellSignals = signals.filter(s => s.signal === 'SELL').length
    const holdSignals = signals.filter(s => s.signal === 'HOLD').length
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length

    return {
      total: signals.length,
      buy: buySignals,
      sell: sellSignals,
      hold: holdSignals,
      avgConfidence: avgConfidence.toFixed(1)
    }
  }

  const stats = getSignalStats()

  // Get today's signals only
  const getTodaySignals = () => {
    if (!signalHistory?.data) return []
    
    const today = new Date().toDateString()
    return signalHistory.data.filter(signal => {
      const signalDate = new Date(signal.timestamp).toDateString()
      return signalDate === today
    })
  }

  const todaySignals = getTodaySignals()

  // Get current signal advice
  const getCurrentAdvice = () => {
    if (!realTimeSignal) return null
    
    const signal = realTimeSignal.signal
    const confidence = realTimeSignal.confidence
    const currentPrice = realTimeSignal.currentPrice
    
    let advice = ''
    let type = 'info'
    let icon = null
    
    if (signal === 'BUY' && confidence > 60) {
      advice = `STRONG BUY - Price: ${currentPrice.toFixed(5)}`
      type = 'success'
      icon = <ArrowUpOutlined />
    } else if (signal === 'SELL' && confidence > 60) {
      advice = `STRONG SELL - Price: ${currentPrice.toFixed(5)}`
      type = 'error'
      icon = <ArrowDownOutlined />
    } else if (signal === 'BUY') {
      advice = `WEAK BUY - Price: ${currentPrice.toFixed(5)}`
      type = 'warning'
      icon = <ArrowUpOutlined />
    } else if (signal === 'SELL') {
      advice = `WEAK SELL - Price: ${currentPrice.toFixed(5)}`
      type = 'warning'
      icon = <ArrowDownOutlined />
    } else {
      advice = `HOLD - Price: ${currentPrice.toFixed(5)}`
      type = 'info'
      icon = <ClockCircleOutlined />
    }
    
    return {
      advice,
      type,
      icon,
      confidence,
      signal,
      currentPrice,
      session: realTimeSignal.session,
      volatility: realTimeSignal.volatility
    }
  }

  const currentAdvice = getCurrentAdvice()

  return (
    <div className="app-content">
      <div className="page-header">
        <h1 className="page-title">Trading Signals</h1>
        <p className="page-description">
          Historical trading signals and analysis for currency pairs
        </p>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 8 }}>Currency Pair:</span>
            <Select
              value={selectedPair}
              onChange={setSelectedPair}
              style={{ width: 120 }}
            >
              <Option value="EUR/USD">EUR/USD</Option>
              <Option value="GBP/USD">GBP/USD</Option>
              <Option value="USD/JPY">USD/JPY</Option>
              <Option value="USD/CHF">USD/CHF</Option>
              <Option value="AUD/USD">AUD/USD</Option>
            </Select>
          </Col>
          <Col>
            <span style={{ marginRight: 8 }}>Timeframe:</span>
            <Select
              value={selectedTimeframe}
              onChange={setSelectedTimeframe}
              style={{ width: 100 }}
            >
              <Option value="1h">1 Hour</Option>
              <Option value="4h">4 Hours</Option>
              <Option value="1day">1 Day</Option>
            </Select>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Real-Time Trading Advice */}
      {currentAdvice && (
        <Card 
          title={
            <Space>
              <Badge status="processing" text="Live Trading Signal" />
              <Text type="secondary">Updates every 30 seconds</Text>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Alert
            message={
              <Space>
                {currentAdvice.icon}
                <Title level={4} style={{ margin: 0 }}>
                  {currentAdvice.advice}
                </Title>
              </Space>
            }
            description={
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Confidence: </Text>
                  <Text style={{ color: currentAdvice.confidence > 70 ? '#52c41a' : currentAdvice.confidence > 50 ? '#faad14' : '#ff4d4f' }}>
                    {currentAdvice.confidence}%
                  </Text>
                </Col>
                <Col span={8}>
                  <Text strong>Session: </Text>
                  <Text>{currentAdvice.session}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Volatility: </Text>
                  <Tag color={currentAdvice.volatility === 'High' ? 'red' : currentAdvice.volatility === 'Medium' ? 'orange' : 'green'}>
                    {currentAdvice.volatility}
                  </Tag>
                </Col>
              </Row>
            }
            type={currentAdvice.type}
            showIcon
            action={
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={refetchRealTime}
                loading={realTimeLoading}
              >
                Refresh
              </Button>
            }
          />
        </Card>
      )}

      {/* Today's Signals Summary */}
      {todaySignals.length > 0 && (
        <Card title="Today's Signals Summary" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Today's Signals"
                value={todaySignals.length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Buy Signals Today"
                value={todaySignals.filter(s => s.signal === 'BUY').length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ArrowUpOutlined />}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Sell Signals Today"
                value={todaySignals.filter(s => s.signal === 'SELL').length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ArrowDownOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Signals"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Buy Signals"
                value={stats.buy}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Sell Signals"
                value={stats.sell}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Avg Confidence"
                value={stats.avgConfidence}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Signals Table */}
      <Card title={`Signal History - ${selectedPair} (${selectedTimeframe})`}>
        <Table
          columns={columns}
          dataSource={signalHistory?.data || []}
          loading={isLoading}
          rowKey="timestamp"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} signals`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Today's Signals Table */}
      {todaySignals.length > 0 && (
        <Card title={`Today's Signals - ${selectedPair}`} style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={todaySignals}
            loading={isLoading}
            rowKey="timestamp"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} signals today`,
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        </Card>
      )}
    </div>
  )
}

export default Signals
