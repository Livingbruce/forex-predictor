import React, { useState, useEffect } from 'react'
import { Layout, Select, Button, Space, Badge, Tooltip } from 'antd'
import { ReloadOutlined, BellOutlined, SettingOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useWebSocket } from '../services/websocketService'
import { useTheme } from '../contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'

const { Header: AntHeader } = Layout
const { Option } = Select

const Header = ({ selectedPair, onPairChange }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [notifications, setNotifications] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const { isConnected, connectionStatus } = useWebSocket()
  const { isDarkMode, toggleTheme, colors } = useTheme()

  // Fetch debug information
  const { data: liveData, isLoading: liveLoading, error: liveError } = useQuery({
    queryKey: ['live', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/live/${encodeURIComponent(selectedPair)}`)
      .then(res => res.json()),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  const { data: historicalData, isLoading: historicalLoading, error: historicalError } = useQuery({
    queryKey: ['historical', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/data/historical`)
      .then(res => res.json()),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  // Check backend status
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
    const interval = setInterval(checkBackendStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const currencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD',
    'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
  ]

  const handlePairChange = (value) => {
    onPairChange(value)
    // Emit pair change event to WebSocket
    if (window.socket) {
      window.socket.emit('subscribe', { pair: value, interval: '1h' })
    }
  }

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLastUpdate(new Date())
    
    try {
      // Trigger data refresh
      if (window.socket) {
        window.socket.emit('refresh', { pair: selectedPair })
      }
      
      // Simulate refresh delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Force page refresh for demo
      window.location.reload()
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleStatusClick = () => {
    // Show detailed status information
    const statusInfo = {
      backend: backendStatus,
      liveData: liveData?.success ? 'Connected' : 'Disconnected',
      historicalData: historicalData?.length > 0 ? `${historicalData.length} candles` : 'No data',
      lastUpdate: lastUpdate.toLocaleTimeString(),
      selectedPair: selectedPair
    }
    
    alert(`System Status:\n• Backend: ${statusInfo.backend}\n• Live Data: ${statusInfo.liveData}\n• Historical Data: ${statusInfo.historicalData}\n• Last Update: ${statusInfo.lastUpdate}\n• Currency Pair: ${statusInfo.selectedPair}`)
  }

  const handleNotifications = () => {
    // Generate mock notifications
    const mockNotifications = [
      { id: 1, message: `New signal generated for ${selectedPair}`, time: '2 min ago', type: 'signal' },
      { id: 2, message: 'Market volatility increased', time: '5 min ago', type: 'market' },
      { id: 3, message: 'Pattern detected: Double Top', time: '10 min ago', type: 'pattern' }
    ]
    setNotifications(mockNotifications)
    
    // Show notification dropdown (simplified)
    alert(`Notifications:\n${mockNotifications.map(n => `• ${n.message} (${n.time})`).join('\n')}`)
  }

  const handleSettings = () => {
    setSettingsOpen(true)
    // Show settings modal (simplified)
    alert('Settings Panel:\n• Chart Theme: Dark\n• Auto-refresh: 30s\n• Notifications: Enabled\n• Currency Format: 4 decimals')
  }

  useEffect(() => {
    // Update last update time every minute
    const interval = setInterval(() => {
      setLastUpdate(prev => new Date(prev.getTime() + 60000))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
        <AntHeader
          style={{
            background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceElevated} 100%)`,
            padding: '0 20px',
            borderBottom: `1px solid ${colors.border}`,
            marginLeft: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            right: 0,
            left: '250px',
            zIndex: 999,
            height: '56px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Currency Pair Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                color: colors.textSecondary, 
                fontSize: '13px', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Currency
              </span>
              <Select
                value={selectedPair}
                onChange={handlePairChange}
                style={{ width: 100 }}
                size="small"
                variant="filled"
                className="header-select"
              >
                {currencyPairs.map(pair => (
                  <Option key={pair} value={pair}>
                    {pair}
                  </Option>
                ))}
              </Select>
            </div>
            
            {/* Last Update Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                color: colors.textSecondary, 
                fontSize: '13px', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Last Update
              </span>
              <span style={{ 
                color: colors.text, 
                fontSize: '13px', 
                fontWeight: '600',
                fontFamily: 'monospace'
              }}>
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            
            {/* Status Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Tooltip title="Click for detailed system status">
                <div 
                  className="status-indicator"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    padding: '6px 10px',
                    backgroundColor: backendStatus === 'online' ? 'rgba(82, 196, 26, 0.15)' : 'rgba(255, 77, 79, 0.15)',
                    borderRadius: '6px',
                    border: `1px solid ${backendStatus === 'online' ? 'rgba(82, 196, 26, 0.4)' : 'rgba(255, 77, 79, 0.4)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleStatusClick}
                >
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: backendStatus === 'online' ? colors.success : colors.error,
                    boxShadow: backendStatus === 'online' ? '0 0 6px rgba(82, 196, 26, 0.6)' : '0 0 6px rgba(255, 77, 79, 0.6)'
                  }} />
                  <span style={{ 
                    color: backendStatus === 'online' ? colors.success : colors.error,
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>
                    {backendStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </Tooltip>
              
              {liveData?.success && (
                <Tooltip title="Click for live data details">
                  <div 
                    className="status-indicator"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: 'rgba(24, 144, 255, 0.15)',
                      borderRadius: '6px',
                      border: '1px solid rgba(24, 144, 255, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      const liveInfo = liveData?.data
                      alert(`Live Data Details:\n• Pair: ${liveInfo?.pair}\n• Price: ${liveInfo?.close}\n• Source: ${liveInfo?.source}\n• Timestamp: ${liveInfo?.timestamp}`)
                    }}
                  >
                    <span style={{ color: colors.info, fontSize: '14px' }}>📊</span>
                    <span style={{ 
                      color: colors.info, 
                      fontWeight: '600', 
                      fontSize: '12px'
                    }}>
                      Live Data
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tooltip title="Toggle Theme">
              <Button 
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} 
                onClick={toggleTheme}
                type="text"
                size="small"
                className="header-button"
              />
            </Tooltip>
            
            <Tooltip title={isRefreshing ? "Refreshing..." : "Refresh Data"}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                type="text"
                size="small"
                loading={isRefreshing}
                disabled={isRefreshing}
                className="header-button"
                style={{ 
                  transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </Tooltip>
            
            <Tooltip title="Notifications">
              <Button 
                icon={<BellOutlined />} 
                onClick={handleNotifications}
                type="text"
                size="small"
                className="header-button"
              />
            </Tooltip>
            
            <Tooltip title="Settings">
              <Button 
                icon={<SettingOutlined />} 
                onClick={handleSettings}
                type="text"
                size="small"
                className="header-button"
              />
            </Tooltip>
          </div>
        </AntHeader>
  )
}

export default Header
