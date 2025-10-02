import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, Typography } from 'antd'
import { DollarOutlined, ThunderboltOutlined, FireOutlined, TrophyOutlined } from '@ant-design/icons'
import { getSignalColor, getVolatilityColor } from '../utils/colorUtils'

const { Title, Text } = Typography

const SignalPanel = ({ 
  selectedPair = 'EUR/USD', 
  signalResponse, 
  signalsLoading, 
  signalsError, 
  backendStatus, 
  setBackendStatus 
}) => {
  const [signalData, setSignalData] = useState(null)

  // Debug: Component mount
  console.log('📊 SignalPanel mounted for pair:', selectedPair)

  // Update backend status based on query results
  useEffect(() => {
    if (signalsError) {
      console.log('📊 Setting backend status to offline due to error:', signalsError)
      setBackendStatus('offline')
    } else if (signalResponse) {
      console.log('📊 Setting backend status to online due to successful data fetch')
      setBackendStatus('online')
    }
  }, [signalResponse, signalsError])

  // Update state when data changes
  useEffect(() => {
    if (!signalResponse) return // Skip if not ready yet
    
    if (signalResponse && typeof signalResponse === 'object') {
      console.log('📊 Signal data received:', signalResponse)
      setSignalData(signalResponse)
    }
  }, [signalResponse])

  // Debug: Log current state
  console.log('📊 SignalPanel State:', {
    signalData,
    signalsLoading,
    signalsError,
    backendStatus
  })

  // Helper functions for styling

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
          <FireOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
          <Title level={4} style={{ color: '#ff4d4f', margin: 0 }}>
            Signal Error
          </Title>
          <Text style={{ color: '#8c8c8c' }}>
            Failed to load signals: {signalsError.message}
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={6}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          styles={{ body: { padding: '20px', textAlign: 'center' } }}
        >
          <DollarOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
          <Statistic
            title={<span style={{ color: '#8c8c8c' }}>Current Price</span>}
            value={signalData && typeof signalData.currentPrice === 'number' ? signalData.currentPrice.toFixed(5) : (signalsLoading ? 'Loading...' : 'N/A')}
            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
          />
          <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            Pair: {selectedPair}
          </Text>
        </Card>
      </Col>
      
      <Col xs={24} sm={6}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          styles={{ body: { padding: '20px', textAlign: 'center' } }}
        >
          <ThunderboltOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
          <Statistic
            title={<span style={{ color: '#8c8c8c' }}>Volatility</span>}
            value={signalData ? signalData.volatility || 'Unknown' : (signalsLoading ? 'Loading...' : 'Unknown')}
            valueStyle={{ 
              color: getVolatilityColor(signalData?.volatility || 'Unknown'),
              fontSize: '20px',
              textTransform: 'capitalize'
            }}
          />
          <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            Market Risk Level
          </Text>
        </Card>
      </Col>
      
      <Col xs={24} sm={6}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          styles={{ body: { padding: '20px', textAlign: 'center' } }}
        >
          <FireOutlined style={{ fontSize: '32px', color: '#ff4d4f', marginBottom: '12px' }} />
          <Statistic
            title={<span style={{ color: '#8c8c8c' }}>AI Signal</span>}
            value={signalData ? (typeof signalData.signal === 'string' ? signalData.signal : signalData.signal?.action || 'HOLD') : (signalsLoading ? 'Loading...' : 'HOLD')}
            valueStyle={{ 
              color: getSignalColor(typeof signalData?.signal === 'string' ? signalData.signal : signalData?.signal?.action),
              fontSize: '20px',
              textTransform: 'uppercase'
            }}
          />
          <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            Confidence: {signalData ? signalData.confidence || 0 : (signalsLoading ? 'Loading...' : 0)}%
          </Text>
        </Card>
      </Col>
      
      <Col xs={24} sm={6}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          styles={{ body: { padding: '20px', textAlign: 'center' } }}
        >
          <TrophyOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
          <Statistic
            title={<span style={{ color: '#8c8c8c' }}>Session</span>}
            value={signalData ? signalData.session || 'Unknown' : (signalsLoading ? 'Loading...' : 'Unknown')}
            valueStyle={{ color: '#1890ff', fontSize: '20px' }}
          />
          <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            Active Market
          </Text>
        </Card>
      </Col>
    </Row>
  )
}

export default React.memo(SignalPanel)
