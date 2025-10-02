import { useState, useEffect, useCallback } from 'react'
// import io from 'socket.io-client'

const useWebSocket = () => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Checking...')

  useEffect(() => {
    // Check backend status
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/health')
        const data = await response.json()
        
        if (data.apis) {
          const alphaVantage = data.apis.alphaVantage === 'configured'
          const twelveData = data.apis.twelveData === 'configured'
          
          if (alphaVantage || twelveData) {
            setConnectionStatus('Real APIs Configured')
            setIsConnected(true)
          } else {
            setConnectionStatus('APIs Not Configured')
            setIsConnected(false)
          }
        } else {
          setConnectionStatus('Backend Online')
          setIsConnected(true)
        }
      } catch (error) {
        setConnectionStatus('Backend Offline')
        setIsConnected(false)
      }
    }
    
    checkBackendStatus()
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  const subscribeToPair = useCallback((pair, interval = '1h') => {
    console.log(`Real-time updates available for ${pair} ${interval}`)
  }, [])

  const unsubscribeFromPair = useCallback((pair, interval = '1h') => {
    console.log(`Unsubscribed from ${pair} ${interval}`)
  }, [])

  const requestRefresh = useCallback((pair) => {
    console.log(`Requesting refresh for ${pair}`)
  }, [])

  return {
    socket: null,
    isConnected,
    connectionStatus,
    subscribeToPair,
    unsubscribeFromPair,
    requestRefresh
  }
}

export { useWebSocket }
export default useWebSocket
