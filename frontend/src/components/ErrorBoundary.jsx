import React from 'react'
import { Result, Button } from 'antd'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '20px'
        }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An error occurred while rendering this component. Please try refreshing the page."
            extra={[
              <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>,
              <Button key="retry" onClick={this.handleReset}>
                Try Again
              </Button>
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
