import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Alert, Button, Space, Typography, Spin } from 'antd'
import { ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchLiveData, fetchHistoricalData, fetchIntelligentSignals, fetchTimingAnalysis } from '../services/apiService'
import { useTheme } from '../contexts/ThemeContext'
import AdvancedChart from '../components/AdvancedChart'
import IntelligencePanel from '../components/IntelligencePanel'
import SignalPanel from '../components/SignalPanel'
import SessionPanel from '../components/SessionPanel'

const { Title, Text } = Typography

const Dashboard = ({ selectedPair = 'EUR/USD' }) => {
  const [historicalData, setHistoricalData] = useState([])
  const [chartStyle, setChartStyle] = useState(() => {
    // Load from localStorage or default to line
    return localStorage.getItem('chartStyle') || 'line'
  })
  const [liveData, setLiveData] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking')
  const { isDarkMode, colors } = useTheme()
  const queryClient = useQueryClient()

  // Save chart style to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chartStyle', chartStyle)
  }, [chartStyle])

  // Debug: Component mount (only log once per pair change)
  console.log('🚀 Dashboard component mounted/rendered for pair:', selectedPair)

  // Centralized API queries - fetch once, pass down to panels
  const { data: liveResponse, isLoading: liveLoading, error: liveError } = useQuery({
    queryKey: ['liveData', selectedPair],
    queryFn: () => fetchLiveData(selectedPair),
    refetchInterval: 1000, // Auto-update every 1 second
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true, // Continue refreshing in background
    retry: 3,
    retryDelay: 1000,
  })

  const { data: historicalResponse, isLoading: historicalLoading, error: historicalError } = useQuery({
    queryKey: ['historicalData', selectedPair],
    queryFn: () => fetchHistoricalData(selectedPair, '1h', 100),
    enabled: true,
    refetchInterval: 1000, // Auto-update every 1 second
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: 1000,
  })

  // Centralized signal data - used by both IntelligencePanel and SignalPanel
  const { data: signalResponse, isLoading: signalsLoading, error: signalsError } = useQuery({
    queryKey: ['intelligentSignals', selectedPair],
    queryFn: () => fetchIntelligentSignals(selectedPair),
    refetchInterval: 1000, // Auto-update every 1 second
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  // Centralized timing data - used by SessionPanel
  const { data: timingResponse, isLoading: timingLoading, error: timingError } = useQuery({
    queryKey: ['timingAnalysis', selectedPair],
    queryFn: () => fetchTimingAnalysis(selectedPair),
    refetchInterval: 1000, // Auto-update every 1 second
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  // Debug: Log query states after all queries are declared
  console.log('🚀 Historical query state:', { historicalResponse, historicalLoading, historicalError })

  // Update state when data changes
  useEffect(() => {
    if (liveResponse) {
      console.log('💰 Live data received:', liveResponse)
      setLiveData(liveResponse.data || liveResponse)
    }
  }, [liveResponse])

  useEffect(() => {
    if (historicalResponse?.data?.candles) {
      console.log('📈 Historical data received:', historicalResponse.data.candles.length, 'candles')
      setHistoricalData(historicalResponse.data.candles)
    } else if (historicalError) {
      console.error('📈 Historical data error:', historicalError)
    } else if (historicalLoading) {
      console.log('📈 Historical data loading...')
    } else {
      console.log('📈 Historical data not available')
    }
  }, [historicalResponse, historicalLoading, historicalError])

  // Manual backend status check
  useEffect(() => {
    const checkBackendStatus = async () => {
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

    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: '24px', background: isDarkMode ? '#0a0a0a' : '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2} style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: '24px' }}>
        📊 Forex Intelligence Dashboard
      </Title>

      {/* Backend Status Alert */}
      {backendStatus === 'offline' && (
        <Alert
          message="Backend Connection Issue"
          description="The intelligent forex backend is currently offline. Some features may not be available."
          type="error"
          showIcon
          action={
            <Space>
              <Button 
                size="small" 
                danger 
                icon={<ReloadOutlined />}
                onClick={async () => {
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
                }}
              >
                Check Status
              </Button>
            </Space>
          }
          style={{ marginBottom: 20 }}
          closable
        />
      )}

      {/* Backend Status Success */}
      {backendStatus === 'online' && (
        <Alert
          message="Backend Online"
          description="Intelligent forex backend is connected. Live data and AI signals are active."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 20 }}
          closable
        />
      )}

      {/* Intelligence Panel */}
      <IntelligencePanel 
        selectedPair={selectedPair}
        signalResponse={signalResponse}
        signalsLoading={signalsLoading}
        signalsError={signalsError}
        backendStatus={backendStatus}
        setBackendStatus={setBackendStatus}
      />

      {/* Signal Panel */}
      <SignalPanel 
        selectedPair={selectedPair}
        signalResponse={signalResponse}
        signalsLoading={signalsLoading}
        signalsError={signalsError}
        backendStatus={backendStatus}
        setBackendStatus={setBackendStatus}
      />

      {/* Session Panel */}
      <SessionPanel 
        selectedPair={selectedPair}
        timingResponse={timingResponse}
        timingLoading={timingLoading}
        timingError={timingError}
        backendStatus={backendStatus}
        setBackendStatus={setBackendStatus}
      />

      {/* Advanced Chart */}
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
        <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
          📈 Advanced Chart Analysis
        </Title>
        
        {historicalLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <Text style={{ color: '#8c8c8c', marginLeft: '12px' }}>
              Loading chart data...
            </Text>
          </div>
        ) : historicalError ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff4d4f' }}>
            <ExclamationCircleOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
            <Text style={{ color: '#ff4d4f' }}>
              Failed to load chart data: {historicalError.message}
            </Text>
          </div>
        ) : historicalData.length > 0 ? (
          <AdvancedChart 
            data={historicalData} 
            selectedPair={selectedPair}
            chartStyle={chartStyle}
            onChartStyleChange={setChartStyle}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text style={{ color: '#8c8c8c' }}>
              No chart data available for {selectedPair}
            </Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Dashboard