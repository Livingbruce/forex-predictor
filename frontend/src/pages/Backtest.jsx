import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Select, 
  InputNumber, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  Table,
  Alert,
  Spin
} from 'antd'
import { PlayCircleOutlined, BarChartOutlined } from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMutation } from '@tanstack/react-query'
import { runBacktest } from '../services/apiService'

const { Option } = Select

const Backtest = ({ selectedPair = 'EUR/USD' }) => {
  const [form] = Form.useForm()
  const [backtestResults, setBacktestResults] = useState(() => {
    // Load saved results from localStorage on component mount
    const saved = localStorage.getItem('backtestResults')
    return saved ? JSON.parse(saved) : null
  })

  const backtestMutation = useMutation({
    mutationFn: runBacktest,
  })

  // Update form when selectedPair changes
  useEffect(() => {
    form.setFieldsValue({
      pair: selectedPair
    })
  }, [selectedPair, form])

  // Handle mutation success/error
  useEffect(() => {
    if (backtestMutation.isSuccess) {
      setBacktestResults(backtestMutation.data)
      // Save results to localStorage for persistence
      localStorage.setItem('backtestResults', JSON.stringify(backtestMutation.data))
    }
    if (backtestMutation.isError) {
      console.error('Backtest failed:', backtestMutation.error)
    }
  }, [backtestMutation.isSuccess, backtestMutation.isError, backtestMutation.data, backtestMutation.error])

  const handleRunBacktest = async (values) => {
    try {
      // Map frontend form values to backend API parameters
      const backtestParams = {
        pair: values.pair,
        strategy: 'intelligent',
        timeframe: values.timeframe,
        startDate: new Date(Date.now() - (values.candles || 500) * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        initialCapital: values.startingCapital || 10000
      }
      
      await backtestMutation.mutateAsync(backtestParams)
    } catch (error) {
      console.error('Backtest error:', error)
    }
  }

  // Helper function to safely parse numeric values
  const safeParseFloat = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') return defaultValue
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Clear saved results
  const clearResults = () => {
    setBacktestResults(null)
    localStorage.removeItem('backtestResults')
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <h1 className="page-title">Strategy Backtesting</h1>
        <p className="page-description">
          Test trading strategies against historical data to evaluate performance
        </p>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card title="Backtest Parameters">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRunBacktest}
              initialValues={{
                pair: selectedPair,
                timeframe: '1h',
                candles: 500,
                riskPerTrade: 0.01,
                startingCapital: 10000,
                holdMaxBars: 48
              }}
            >
              <Form.Item
                label="Currency Pair"
                name="pair"
                rules={[{ required: true, message: 'Please select a currency pair' }]}
              >
                <Select>
                  <Option value="EUR/USD">EUR/USD</Option>
                  <Option value="GBP/USD">GBP/USD</Option>
                  <Option value="USD/JPY">USD/JPY</Option>
                  <Option value="USD/CHF">USD/CHF</Option>
                  <Option value="AUD/USD">AUD/USD</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Timeframe"
                name="timeframe"
                rules={[{ required: true, message: 'Please select a timeframe' }]}
              >
                <Select>
                  <Option value="1h">1 Hour</Option>
                  <Option value="4h">4 Hours</Option>
                  <Option value="1day">1 Day</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Historical Candles"
                name="candles"
                rules={[{ required: true, message: 'Please enter number of candles' }]}
              >
                <InputNumber
                  min={100}
                  max={2000}
                  style={{ width: '100%' }}
                  placeholder="Number of candles to analyze"
                />
              </Form.Item>

              <Form.Item
                label="Risk Per Trade (%)"
                name="riskPerTrade"
                rules={[{ required: true, message: 'Please enter risk per trade' }]}
              >
                <InputNumber
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  style={{ width: '100%' }}
                  placeholder="Risk percentage per trade"
                />
              </Form.Item>

              <Form.Item
                label="Starting Capital ($)"
                name="startingCapital"
                rules={[{ required: true, message: 'Please enter starting capital' }]}
              >
                <InputNumber
                  min={1000}
                  max={1000000}
                  step={1000}
                  style={{ width: '100%' }}
                  placeholder="Starting capital amount"
                />
              </Form.Item>

              <Form.Item
                label="Max Hold Bars"
                name="holdMaxBars"
                rules={[{ required: true, message: 'Please enter max hold bars' }]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  style={{ width: '100%' }}
                  placeholder="Maximum bars to hold position"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlayCircleOutlined />}
                  loading={backtestMutation.isLoading}
                  block
                  size="large"
                >
                  Run Backtest
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {backtestMutation.isLoading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', fontSize: '16px' }}>
                  Running backtest analysis...
                </div>
              </div>
            </Card>
          ) : backtestMutation.isError ? (
            <Alert
              message="Backtest Failed"
              description={backtestMutation.error?.message || 'An error occurred during backtesting'}
              type="error"
              showIcon
            />
          ) : backtestResults ? (
            <>
              {/* Results Summary */}
              <Card 
                title="Backtest Results" 
                style={{ marginBottom: 16 }}
                extra={
                  <Button 
                    type="text" 
                    danger 
                    onClick={clearResults}
                    size="small"
                  >
                    Clear Results
                  </Button>
                }
              >
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Total Trades"
                      value={backtestResults.totalTrades || 0}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Win Rate"
                      value={safeParseFloat(backtestResults.winRate)}
                      suffix="%"
                      valueStyle={{ 
                        color: safeParseFloat(backtestResults.winRate) > 50 ? '#52c41a' : '#ff4d4f' 
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Total Return"
                      value={safeParseFloat(backtestResults.totalReturn)}
                      suffix="%"
                      valueStyle={{ 
                        color: safeParseFloat(backtestResults.totalReturn) > 0 ? '#52c41a' : '#ff4d4f' 
                      }}
                    />
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Profit Factor"
                      value={safeParseFloat(backtestResults.profitFactor)}
                      precision={2}
                      valueStyle={{ 
                        color: safeParseFloat(backtestResults.profitFactor) > 1 ? '#52c41a' : '#ff4d4f' 
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Max Drawdown"
                      value={safeParseFloat(backtestResults.maxDrawdown)}
                      suffix="%"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Sharpe Ratio"
                      value={safeParseFloat(backtestResults.sharpeRatio)}
                      precision={2}
                      valueStyle={{ 
                        color: safeParseFloat(backtestResults.sharpeRatio) > 0 ? '#52c41a' : '#ff4d4f' 
                      }}
                    />
                  </Col>
                </Row>

                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8 }}>Win Rate Progress</div>
                  <Progress
                    percent={safeParseFloat(backtestResults.winRate)}
                    strokeColor={safeParseFloat(backtestResults.winRate) > 50 ? '#52c41a' : '#ff4d4f'}
                    showInfo={false}
                  />
                  <div style={{ textAlign: 'center', marginTop: 4 }}>
                    {backtestResults.pair || 'N/A'} - {backtestResults.timeframe || 'N/A'} timeframe
                  </div>
                </div>
              </Card>

              {/* Additional Info */}
              <Card title="Backtest Details">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Currency Pair:</strong> {backtestResults.pair || 'N/A'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Timeframe:</strong> {backtestResults.timeframe || 'N/A'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Strategy:</strong> {backtestResults.strategy || 'N/A'}
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Start Date:</strong> {backtestResults.period?.start ? new Date(backtestResults.period.start).toLocaleDateString() : 'N/A'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>End Date:</strong> {backtestResults.period?.end ? new Date(backtestResults.period.end).toLocaleDateString() : 'N/A'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Initial Capital:</strong> ${backtestResults.initialCapital || 'N/A'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Final Capital:</strong> ${backtestResults.finalCapital ? backtestResults.finalCapital.toFixed(2) : 'N/A'}
                    </div>
                  </Col>
                </Row>
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <BarChartOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
                <div style={{ marginTop: '16px', fontSize: '16px', color: '#8c8c8c' }}>
                  Configure parameters and run a backtest to see results
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default Backtest
