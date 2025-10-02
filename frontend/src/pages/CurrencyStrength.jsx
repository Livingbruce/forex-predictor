import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Spin, Alert, Button, Space, Tooltip, Progress, Tag, List } from 'antd'
import { 
  ThunderboltOutlined, 
  ArrowUpOutlined,
  ArrowDownOutlined, 
  InfoCircleOutlined,
  ReloadOutlined,
  FireOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrencyStrength } from '../services/apiService'

const { Title, Text } = Typography

const CurrencyStrengthPage = ({ selectedPair }) => {
  const { data: strengthData, isLoading, error, refetch } = useQuery({
    queryKey: ['currencyStrength', selectedPair],
    queryFn: () => fetchCurrencyStrength(selectedPair),
    refetchInterval: 10000, // Quiet auto-refresh every 10 seconds
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  const getStrengthColor = (strength) => {
    if (strength >= 80) return '#52c41a' // Green
    if (strength >= 60) return '#a0d911' // Lime Green
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

  const sortedCurrencies = strengthData?.data 
    ? Object.entries(strengthData.data).sort(([, a], [, b]) => b.strength - a.strength) 
    : []

  const strongestCurrencies = sortedCurrencies.slice(0, 3)
  const weakestCurrencies = sortedCurrencies.slice(-3).reverse()

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <Title level={2}>Currency Strength Meter</Title>
        <Text type="secondary">
          Real-time analysis of currency strength across major pairs for {selectedPair}
        </Text>
      </div>

      {error && (
        <Alert
          message="Error"
          description={`Failed to fetch currency strength data: ${error.message}`}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <span className="loading-text">Loading currency strength data...</span>
        </div>
      ) : (
        <>
          {/* Top Performers */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <FireOutlined style={{ color: '#52c41a' }} />
                    <span>Strongest Currencies</span>
                  </Space>
                }
                extra={
                  <Tooltip title="Refresh Data">
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleRefresh} 
                      type="text" 
                      style={{ color: '#fff' }}
                    />
                  </Tooltip>
                }
                style={{ 
                  borderRadius: '12px'
                }}
              >
                <Row gutter={[16, 16]}>
                  {strongestCurrencies.map(([currency, data], index) => (
                    <Col span={8} key={currency}>
                      <div style={{ 
                        padding: '16px', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        border: `2px solid ${getStrengthColor(data.strength)}`,
                        boxShadow: `0 2px 8px ${getStrengthColor(data.strength)}20`
                      }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#8c8c8c', 
                          marginBottom: '4px',
                          fontWeight: '500'
                        }}>
                          #{index + 1}
                        </div>
                        <Text strong style={{ color: '#fff', fontSize: '18px' }}>{currency}</Text>
                        <div style={{ 
                          color: getStrengthColor(data.strength), 
                          fontSize: '24px', 
                          fontWeight: '700',
                          marginTop: '8px'
                        }}>
                          {data.strength}%
                        </div>
                        <div style={{ 
                          color: getChangeColor(data.change), 
                          fontSize: '12px',
                          marginTop: '4px'
                        }}>
                          {getTrendIcon(data.trend)} {data.change > 0 ? '+' : ''}{data.change}%
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                    <span>Weakest Currencies</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px'
                }}
              >
                <Row gutter={[16, 16]}>
                  {weakestCurrencies.map(([currency, data], index) => (
                    <Col span={8} key={currency}>
                      <div style={{ 
                        padding: '16px', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        border: `2px solid ${getStrengthColor(data.strength)}`,
                        boxShadow: `0 2px 8px ${getStrengthColor(data.strength)}20`
                      }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#8c8c8c', 
                          marginBottom: '4px',
                          fontWeight: '500'
                        }}>
                          #{sortedCurrencies.length - index}
                        </div>
                        <Text strong style={{ color: '#fff', fontSize: '18px' }}>{currency}</Text>
                        <div style={{ 
                          color: getStrengthColor(data.strength), 
                          fontSize: '24px', 
                          fontWeight: '700',
                          marginTop: '8px'
                        }}>
                          {data.strength}%
                        </div>
                        <div style={{ 
                          color: getChangeColor(data.change), 
                          fontSize: '12px',
                          marginTop: '4px'
                        }}>
                          {getTrendIcon(data.trend)} {data.change > 0 ? '+' : ''}{data.change}%
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Detailed Currency Analysis */}
          <Card 
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                <span>Complete Currency Strength Analysis</span>
              </Space>
            }
            extra={
              <Space>
                <Tooltip title="What is Currency Strength?">
                  <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                </Tooltip>
                <Tooltip title="Refresh Analysis">
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
              borderRadius: '12px'
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={sortedCurrencies}
              renderItem={([currency, data], index) => (
                <List.Item style={{ 
                  borderBottom: '1px dashed #2a2a2a', 
                  background: selectedPair.includes(currency) ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                  borderRadius: '8px',
                  margin: '4px 0',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ 
                      minWidth: '30px', 
                      textAlign: 'center',
                      color: '#8c8c8c',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      #{index + 1}
                    </div>
                    
                    <Text strong style={{ color: '#fff', minWidth: '50px', fontSize: '16px' }}>
                      {currency}
                    </Text>
                    
                    {selectedPair.includes(currency) && (
                      <Tag color="blue" style={{ marginLeft: 8, marginRight: 8 }}>
                        Selected Pair
                      </Tag>
                    )}
                    
                    <div style={{ flex: 1, margin: '0 16px' }}>
                      <Progress 
                        percent={data.strength} 
                        size="small" 
                        showInfo={false} 
                        strokeColor={getStrengthColor(data.strength)}
                        trailColor="#2a2a2a"
                        strokeWidth={8}
                        style={{ borderRadius: '4px' }}
                      />
                    </div>
                    
                    <div style={{ 
                      minWidth: '80px', 
                      textAlign: 'right',
                      marginRight: '12px'
                    }}>
                      <Text style={{ 
                        color: getStrengthColor(data.strength), 
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        {data.strength}%
                      </Text>
                    </div>
                    
                    <div style={{ 
                      minWidth: '60px', 
                      textAlign: 'right',
                      color: getChangeColor(data.change),
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {getTrendIcon(data.trend)} {data.change > 0 ? '+' : ''}{data.change}%
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </>
      )}
    </div>
  )
}

export default CurrencyStrengthPage
