import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    colorBgContainer: '#ffffff',
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
    },
    Card: {
      borderRadius: 8,
    },
  },
}

// Note: React.StrictMode helps catch issues but triggers findDOMNode warnings from Ant Design
// These warnings come from Ant Design's internal use of findDOMNode in components like Tooltip and ResizeObserver
// 
// Options to handle this:
// 1. Keep StrictMode disabled during development (current approach)
// 2. Re-enable StrictMode and ignore the warnings (they don't break functionality)
// 3. Wait for Ant Design to update their components to use refs instead of findDOMNode
//
// For production, consider re-enabling StrictMode for better error detection
ReactDOM.createRoot(document.getElementById('root')).render(
  // Temporarily removed StrictMode to suppress findDOMNode warnings from Ant Design
  // Re-enable in production: <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  // </React.StrictMode>
)
