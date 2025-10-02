import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    
    // Update document class for global styling
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Dark theme colors
      background: '#0e0e0e',
      surface: '#1a1a1a',
      surfaceElevated: '#2a2a2a',
      border: '#2a2a2a',
      borderSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#8c8c8c',
      textTertiary: '#595959',
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
      info: '#1890ff',
    } : {
      // Light theme colors
      background: '#f5f5f5',
      surface: '#ffffff',
      surfaceElevated: '#fafafa',
      border: '#d9d9d9',
      borderSecondary: '#f0f0f0',
      text: '#1a1a1a',
      textSecondary: '#595959',
      textTertiary: '#8c8c8c',
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
      info: '#1890ff',
    }
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
