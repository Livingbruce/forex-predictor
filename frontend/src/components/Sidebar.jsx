import React, { useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  SettingOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  RobotOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

const { Sider } = Layout

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode, colors } = useTheme()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/ai-market-analysis',
      icon: <BulbOutlined />,
      label: 'Professional AI Analysis',
    },
    {
      key: '/signals',
      icon: <ThunderboltOutlined />,
      label: 'Trading Signals',
    },
    {
      key: '/backtest',
      icon: <BarChartOutlined />,
      label: 'Backtesting',
    },
    {
      key: '/currency-strength',
      icon: <LineChartOutlined />,
      label: 'Currency Strength',
    },
    {
      key: '/ai-patterns',
      icon: <RobotOutlined />,
      label: 'AI Pattern Recognition',
    },
    {
      key: '/market-timing',
      icon: <ClockCircleOutlined />,
      label: 'Market Timing Analysis',
    },
    {
      key: '/forex-news',
      icon: <FileTextOutlined />,
      label: 'Forex News',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
        <Sider
          width={collapsed ? 80 : 250}
          collapsed={collapsed}
          collapsible
          onCollapse={onCollapse}
          style={{
            background: colors.background,
            borderRight: `1px solid ${colors.border}`,
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <div style={{ 
            padding: collapsed ? '16px 8px' : '16px', 
            textAlign: 'center',
            borderBottom: `1px solid ${colors.border}`
          }}>
            <GlobalOutlined style={{ 
              fontSize: collapsed ? '20px' : '24px', 
              color: '#1890ff',
              marginRight: collapsed ? '0' : '8px'
            }} />
            {!collapsed && (
              <span style={{ 
                color: colors.text, 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                Forex Predictor
              </span>
            )}
          </div>
          
          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              borderRight: 0,
              marginTop: '16px'
            }}
          />
          
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: collapsed ? '8px' : '16px',
            right: collapsed ? '8px' : '16px',
            color: colors.textSecondary,
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {!collapsed && <div>Version 1.0.0</div>}
            <div style={{ marginTop: collapsed ? '0' : '4px' }}>
              <span style={{ color: '#52c41a' }}>●</span> {!collapsed && 'Online'}
            </div>
          </div>
        </Sider>
  )
}

export default Sidebar
