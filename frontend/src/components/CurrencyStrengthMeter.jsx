import React, { useState, useEffect } from 'react'
import { Card, Progress, Row, Col, Typography, Space, Tag, Tooltip } from 'antd'
import { 
  ThunderboltOutlined, 
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrencyStrength } from '../services/apiService'

const { Title, Text } = Typography

const CurrencyStrengthMeter = ({ selectedPair }) => {
  const [strengthData, setStrengthData] = useState(null)

  const getPairsForCurrency = (currency) => {
    const pairs = {
      'USD': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'],
      'EUR': ['EUR/USD', 'EUR/GBP', 'EUR/JPY'],
      'GBP': ['GBP/USD', 'EUR/GBP', 'GBP/JPY'],
      'JPY': ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
      'CHF': ['USD/CHF'],
      'AUD': ['AUD/USD'],
      'CAD': ['USD/CAD'],
      'NZD': ['NZD/USD']
    }
    return pairs[currency] || []
  }

  const getStrengthColor = (strength) => {
    if (strength >= 80) return '#52c41a' // Green
    if (strength >= 60) return '#73d13d' // Light Green
    if (strength >= 40) return '#faad14' // Orange
    if (strength >= 20) return '#ff7875' // Light Red
    return '#ff4d4f' // Red
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'down':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      case 'sideways':
      case 'neutral':
      default:
        return <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1890ff' }} />
    }
  }

  const getChangeColor = (change) => {
    return change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#8c8c8c'
  }

  // Fetch currency strength data from real API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currency-strength', selectedPair],
    queryFn: () => fetchCurrencyStrength(selectedPair),
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (data?.data) {
      // Transform backend data to match component expectations
      const currencies = Object.entries(data.data).map(([currency, info]) => ({
        currency,
        strength: info.strength,
        trend: info.trend,
        volatility: info.volatility,
        timestamp: info.timestamp,
        pairs: getPairsForCurrency(currency)
      }))
      
      // Sort by strength (highest first)
      currencies.sort((a, b) => b.strength - a.strength)
      
      setStrengthData({
        currencies,
        lastUpdated: Date.now(),
        selectedPair: selectedPair
      })
    }
  }, [data, selectedPair])

  if (error) {
    return (
      <Card title="Currency Strength Meter" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
          Error loading currency strength data
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title={
        <Space>
          <ThunderboltOutlined />
          Currency Strength Meter
        </Space>
      }
      style={{ marginBottom: 16 }}
      extra={
        <Space>
          <Tooltip title="Currency strength is calculated based on multiple factors including economic indicators, central bank policies, and market sentiment">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
          <ReloadOutlined 
            onClick={() => refetch()} 
            style={{ cursor: 'pointer', color: '#1890ff' }}
          />
        </Space>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ marginBottom: 8 }}>Loading currency strength...</div>
        </div>
      ) : strengthData ? (
        <div>
          {/* Top 3 Strongest Currencies */}
          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Strongest Currencies</Title>
            <Row gutter={8}>
              {strengthData.currencies.slice(0, 3).map((currency, index) => (
                <Col span={8} key={currency.currency}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '8px', 
                    backgroundColor: '#f6ffed',
                    borderRadius: '6px',
                    border: '1px solid #b7eb8f'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: getStrengthColor(currency.strength) }}>
                      {currency.currency}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {currency.strength}%
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Individual Currency Strength */}
          <div>
            <Title level={5} style={{ marginBottom: 12 }}>All Currencies</Title>
            {strengthData.currencies.map((currency) => {
              const isSelectedPairCurrency = selectedPair.includes(currency.currency)
              
              return (
                <div 
                  key={currency.currency}
                  style={{ 
                    marginBottom: 12,
                    padding: '8px',
                    backgroundColor: isSelectedPairCurrency ? '#e6f7ff' : 'transparent',
                    borderRadius: '4px',
                    border: isSelectedPairCurrency ? '1px solid #91d5ff' : '1px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Space>
                      <Text strong style={{ fontSize: '14px' }}>
                        {currency.currency}
                      </Text>
                      {isSelectedPairCurrency && (
                        <Tag color="blue" size="small">Selected</Tag>
                      )}
                      {getTrendIcon(currency.trend)}
                    </Space>
                    <Space>
                      <Text style={{ fontSize: '12px', color: getChangeColor(currency.change) }}>
                        {currency.change > 0 ? '+' : ''}{currency.change.toFixed(1)}%
                      </Text>
                      <Text strong style={{ color: getStrengthColor(currency.strength) }}>
                        {currency.strength}%
                      </Text>
                    </Space>
                  </div>
                  <Progress
                    percent={currency.strength}
                    strokeColor={getStrengthColor(currency.strength)}
                    showInfo={false}
                    size="small"
                  />
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 12, fontSize: '11px', color: '#8c8c8c', textAlign: 'center' }}>
            Last updated: {new Date(strengthData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      ) : null}
    </Card>
  )
}

export default CurrencyStrengthMeter
