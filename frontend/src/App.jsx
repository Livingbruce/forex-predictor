import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout, ConfigProvider } from 'antd'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Signals from './pages/Signals'
import Backtest from './pages/Backtest'
import CurrencyStrength from './pages/CurrencyStrength'
import AIPatternRecognition from './pages/AIPatternRecognition'
import MarketTimingAnalysis from './pages/MarketTimingAnalysis'
import ForexNews from './pages/ForexNews'
import AIMarketAnalysis from './pages/AIMarketAnalysis'
import TradingRecommendations from './pages/TradingRecommendations'
import Settings from './pages/Settings'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import './App.css'

const { Content } = Layout

// Dynamic theme configuration based on current theme
const getThemeConfig = (isDarkMode) => ({
  token: {
    colorBgBase: isDarkMode ? '#0e0e0e' : '#f5f5f5',
    colorBgContainer: isDarkMode ? '#1a1a1a' : '#ffffff',
    colorBgElevated: isDarkMode ? '#2a2a2a' : '#fafafa',
    colorBorder: isDarkMode ? '#2a2a2a' : '#d9d9d9',
    colorBorderSecondary: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    colorText: isDarkMode ? '#ffffff' : '#1a1a1a',
    colorTextSecondary: isDarkMode ? '#bfbfbf' : '#595959',
    colorTextTertiary: isDarkMode ? '#8c8c8c' : '#8c8c8c',
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    boxShadowSecondary: isDarkMode ? '0 1px 4px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.05)',
  },
  components: {
    Layout: {
      bodyBg: isDarkMode ? '#0e0e0e' : '#f5f5f5',
      headerBg: isDarkMode ? '#1a1a1a' : '#ffffff',
      siderBg: isDarkMode ? '#0e0e0e' : '#ffffff',
    },
    Card: {
      colorBgContainer: isDarkMode ? '#1a1a1a' : '#ffffff',
      colorBorderSecondary: isDarkMode ? '#2a2a2a' : '#f0f0f0',
    },
    Select: {
      colorBgContainer: isDarkMode ? '#1a1a1a' : '#ffffff',
      colorBorder: isDarkMode ? '#2a2a2a' : '#d9d9d9',
      colorText: isDarkMode ? '#ffffff' : '#1a1a1a',
    },
    Button: {
      colorBgContainer: isDarkMode ? '#1a1a1a' : '#ffffff',
      colorBorder: isDarkMode ? '#2a2a2a' : '#d9d9d9',
      colorText: isDarkMode ? '#ffffff' : '#1a1a1a',
    },
    Tooltip: {
      colorBgSpotlight: isDarkMode ? '#1a1a1a' : '#ffffff',
      colorTextLightSolid: isDarkMode ? '#ffffff' : '#1a1a1a',
    },
    Progress: {
      colorSuccess: '#52c41a',
      colorInfo: '#1890ff',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
    },
    Tag: {
      colorSuccess: '#52c41a',
      colorInfo: '#1890ff',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
    },
    Alert: {
      colorBgContainer: isDarkMode ? '#1a1a1a' : '#ffffff',
      colorBorder: isDarkMode ? '#2a2a2a' : '#d9d9d9',
      colorText: isDarkMode ? '#ffffff' : '#1a1a1a',
      colorTextSecondary: isDarkMode ? '#bfbfbf' : '#595959',
      colorSuccess: '#52c41a',
      colorInfo: '#1890ff',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorSuccessBg: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.06)',
      colorInfoBg: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.06)',
      colorWarningBg: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 173, 20, 0.06)',
      colorErrorBg: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 77, 79, 0.06)',
    }
  }
})

const AppContent = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedPair, setSelectedPair] = useState(() => {
    // Load from localStorage or default to EUR/USD
    return localStorage.getItem('selectedPair') || 'EUR/USD'
  })
  const { isDarkMode } = useTheme()

  // Save selectedPair to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedPair', selectedPair)
  }, [selectedPair])

  return (
    <ConfigProvider theme={getThemeConfig(isDarkMode)}>
      <Layout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0e0e0e' : '#f5f5f5' }}>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s', backgroundColor: isDarkMode ? '#0e0e0e' : '#f5f5f5' }}>
          <Header selectedPair={selectedPair} onPairChange={setSelectedPair} />
          <Content style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: isDarkMode ? '#0e0e0e' : '#f5f5f5', 
            minHeight: 280,
            borderRadius: '8px'
          }}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard selectedPair={selectedPair} />} />
                <Route path="/trading-recommendations" element={<TradingRecommendations selectedPair={selectedPair} />} />
                <Route path="/signals" element={<Signals selectedPair={selectedPair} />} />
                <Route path="/backtest" element={<Backtest selectedPair={selectedPair} />} />
                <Route path="/currency-strength" element={<CurrencyStrength selectedPair={selectedPair} />} />
                <Route path="/ai-patterns" element={<AIPatternRecognition selectedPair={selectedPair} />} />
                <Route path="/market-timing" element={<MarketTimingAnalysis selectedPair={selectedPair} />} />
                <Route path="/forex-news" element={<ForexNews selectedPair={selectedPair} />} />
                <Route path="/ai-market-analysis" element={<AIMarketAnalysis selectedPair={selectedPair} />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </ErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
