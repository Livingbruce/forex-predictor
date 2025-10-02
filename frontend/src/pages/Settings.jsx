import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Switch, 
  Divider, 
  Row, 
  Col,
  Alert,
  message,
  Space,
  Typography,
  Tabs
} from 'antd'
import { SaveOutlined, ReloadOutlined, KeyOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography
const { TabPane } = Tabs

const Settings = () => {
  const [apiForm] = Form.useForm()
  const [tradingForm] = Form.useForm()
  const [apiKeyForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeApiTab, setActiveApiTab] = useState('websocket')
  const queryClient = useQueryClient()

  // Fetch API key status
  const { data: apiKeyStatus, isLoading: apiKeyLoading, error: apiKeyError } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const response = await fetch('/api/user/api-keys');
      const data = await response.json();
      return data.data;
    },
    refetchInterval: 5000
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ keyType, provider, apiKey }) => {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyType, provider, apiKey })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        message.success(data.message);
        queryClient.invalidateQueries(['apiKeys']);
        apiKeyForm.resetFields();
      } else {
        message.error(data.error);
      }
    },
    onError: (error) => {
      message.error('Failed to update API key');
    }
  });

  // Reset API keys mutation
  const resetApiKeysMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/api-keys', {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        message.success(data.message);
        queryClient.invalidateQueries(['apiKeys']);
      } else {
        message.error(data.error);
      }
    },
    onError: (error) => {
      message.error('Failed to reset API keys');
    }
  });

  const handleApiKeySubmit = (values) => {
    updateApiKeyMutation.mutate({
      keyType: activeApiTab + '_keys',
      provider: values.provider,
      apiKey: values.apiKey
    });
  };

  const handleApiKeyReset = () => {
    resetApiKeysMutation.mutate();
  };

  const getProviderStatus = (provider) => {
    if (!apiKeyStatus) return { configured: false, key: '' };
    return apiKeyStatus[activeApiTab + '_keys'][provider] || { configured: false, key: '' };
  };

  const websocketProviders = [
    { key: 'finnhub', name: 'Finnhub', description: 'Real-time forex data via WebSocket' },
    { key: 'alpha_vantage', name: 'Alpha Vantage', description: 'Real-time market data' },
    { key: 'twelve_data', name: 'Twelve Data', description: 'Live forex streaming' }
  ];

  const restProviders = [
    { key: 'alpha_vantage', name: 'Alpha Vantage', description: 'Historical and live data' },
    { key: 'twelve_data', name: 'Twelve Data', description: 'Market data API' },
    { key: 'exchange_rates', name: 'Exchange Rates', description: 'Currency conversion rates' }
  ];

  const currentProviders = activeApiTab === 'websocket' ? websocketProviders : restProviders;

  const handleSave = async () => {
    setLoading(true)
    try {
      // Get values from both forms
      const apiValues = await apiForm.validateFields()
      const tradingValues = await tradingForm.validateFields()
      
      // Combine all settings
      const allSettings = {
        ...apiValues,
        ...tradingValues
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage
      localStorage.setItem('forex-settings', JSON.stringify(allSettings))
      
      message.success('Settings saved successfully!')
    } catch (error) {
      message.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    apiForm.resetFields()
    tradingForm.resetFields()
    message.info('Settings reset to defaults')
  }

  const loadSettings = () => {
    const saved = localStorage.getItem('forex-settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        apiForm.setFieldsValue(settings)
        tradingForm.setFieldsValue(settings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }

  React.useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div className="app-content">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          Configure your forex prediction system preferences and API keys
        </p>
      </div>

      <Tabs defaultActiveKey="api-keys" size="large">
        <TabPane tab={<span><KeyOutlined />API Keys</span>} key="api-keys">
          <Alert
            message="API Key Configuration"
            description="Configure your API keys to enable real-time data streaming and avoid rate limits. Each user needs their own API keys for optimal performance."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Tab Selection */}
              <div>
                <Text strong>Select API Type:</Text>
                <Space style={{ marginLeft: '16px' }}>
                  <Button
                    type={activeApiTab === 'websocket' ? 'primary' : 'default'}
                    onClick={() => setActiveApiTab('websocket')}
                  >
                    WebSocket APIs
                  </Button>
                  <Button
                    type={activeApiTab === 'rest' ? 'primary' : 'default'}
                    onClick={() => setActiveApiTab('rest')}
                  >
                    REST APIs
                  </Button>
                </Space>
              </div>

              <Divider />

              {/* Provider Status */}
              <div>
                <Title level={4}>Current Status</Title>
                <Space wrap>
                  {currentProviders.map(provider => {
                    const status = getProviderStatus(provider.key);
                    return (
                      <Card
                        key={provider.key}
                        size="small"
                        style={{ 
                          width: '200px',
                          border: status.configured ? '1px solid #52c41a' : '1px solid #d9d9d9'
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{provider.name}</Text>
                            {status.configured ? (
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            ) : (
                              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {provider.description}
                          </Text>
                          {status.configured && (
                            <Text code style={{ fontSize: '10px' }}>
                              {status.key}
                            </Text>
                          )}
                        </Space>
                      </Card>
                    );
                  })}
                </Space>
              </div>

              <Divider />

              {/* Add/Update API Key Form */}
              <div>
                <Title level={4}>Add/Update API Key</Title>
                <Form
                  form={apiKeyForm}
                  layout="vertical"
                  onFinish={handleApiKeySubmit}
                  style={{ maxWidth: '500px' }}
                >
                  <Form.Item
                    label="Provider"
                    name="provider"
                    rules={[{ required: true, message: 'Please select a provider' }]}
                  >
                    <Select placeholder="Select a provider">
                      {currentProviders.map(provider => (
                        <Option key={provider.key} value={provider.key}>
                          {provider.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="API Key"
                    name="apiKey"
                    rules={[
                      { required: true, message: 'Please enter your API key' },
                      { min: 10, message: 'API key must be at least 10 characters' }
                    ]}
                  >
                    <Input.Password
                      placeholder="Enter your API key"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateApiKeyMutation.isPending}
                        icon={<KeyOutlined />}
                      >
                        Save API Key
                      </Button>
                      <Button
                        onClick={handleApiKeyReset}
                        loading={resetApiKeysMutation.isPending}
                        icon={<ReloadOutlined />}
                        danger
                      >
                        Reset All Keys
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>

              <Divider />

              {/* Instructions */}
              <div>
                <Title level={4}>Getting API Keys</Title>
                <Space direction="vertical" size="middle">
                  <Card size="small">
                    <Title level={5}>Finnhub (Recommended for WebSocket)</Title>
                    <Text>
                      1. Visit <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">finnhub.io</a><br/>
                      2. Sign up for a free account<br/>
                      3. Get your API key from the dashboard<br/>
                      4. Free tier: 60 calls/minute
                    </Text>
                  </Card>

                  <Card size="small">
                    <Title level={5}>Alpha Vantage</Title>
                    <Text>
                      1. Visit <a href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer">alphavantage.co</a><br/>
                      2. Sign up for a free account<br/>
                      3. Get your API key from the dashboard<br/>
                      4. Free tier: 5 calls/minute, 500 calls/day
                    </Text>
                  </Card>

                  <Card size="small">
                    <Title level={5}>Twelve Data</Title>
                    <Text>
                      1. Visit <a href="https://twelvedata.com" target="_blank" rel="noopener noreferrer">twelvedata.com</a><br/>
                      2. Sign up for a free account<br/>
                      3. Get your API key from the dashboard<br/>
                      4. Free tier: 8 calls/minute, 800 calls/day
                    </Text>
                  </Card>
                </Space>
              </div>
            </Space>
          </Card>
        </TabPane>

        <TabPane tab={<span><SaveOutlined />General Settings</span>} key="general">
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="API Configuration" style={{ marginBottom: 16 }}>
                <Form
                  form={apiForm}
                  layout="vertical"
                  initialValues={{
                    apiProvider: 'alpha',
                    updateInterval: '5min',
                    defaultPair: 'EUR/USD',
                    defaultTimeframe: '1h'
                  }}
                >
                  <Form.Item
                    label="Data Provider"
                    name="apiProvider"
                    tooltip="Choose your preferred forex data provider"
                  >
                    <Select>
                      <Option value="alpha">Alpha Vantage (Free)</Option>
                      <Option value="twelve">Twelve Data (Free)</Option>
                      <Option value="mock">Mock Data (Testing)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Update Interval"
                    name="updateInterval"
                    tooltip="How often to refresh data and signals"
                  >
                    <Select>
                      <Option value="1min">Every Minute</Option>
                      <Option value="5min">Every 5 Minutes</Option>
                      <Option value="15min">Every 15 Minutes</Option>
                      <Option value="30min">Every 30 Minutes</Option>
                      <Option value="1hour">Every Hour</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Default Currency Pair"
                    name="defaultPair"
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
                    label="Default Timeframe"
                    name="defaultTimeframe"
                  >
                    <Select>
                      <Option value="1h">1 Hour</Option>
                      <Option value="4h">4 Hours</Option>
                      <Option value="1day">1 Day</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>

              <Card title="Trading Preferences">
                <Form
                  form={tradingForm}
                  layout="vertical"
                  initialValues={{
                    riskPerTrade: 0.01,
                    defaultStopLoss: 0.02,
                    defaultTakeProfit: 0.03,
                    enableNotifications: true,
                    enableSound: false,
                    autoRefresh: true
                  }}
                >
                  <Form.Item
                    label="Default Risk Per Trade (%)"
                    name="riskPerTrade"
                    tooltip="Percentage of capital to risk per trade"
                  >
                    <Input type="number" min="0.001" max="0.1" step="0.001" />
                  </Form.Item>

                  <Form.Item
                    label="Default Stop Loss (%)"
                    name="defaultStopLoss"
                    tooltip="Default stop loss percentage"
                  >
                    <Input type="number" min="0.001" max="0.1" step="0.001" />
                  </Form.Item>

                  <Form.Item
                    label="Default Take Profit (%)"
                    name="defaultTakeProfit"
                    tooltip="Default take profit percentage"
                  >
                    <Input type="number" min="0.001" max="0.2" step="0.001" />
                  </Form.Item>

                  <Form.Item
                    label="Enable Notifications"
                    name="enableNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Enable Sound Alerts"
                    name="enableSound"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Auto Refresh Data"
                    name="autoRefresh"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="System Information" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Version</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>2.0.0</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Status</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                        ● Online
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Database</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                        ● PostgreSQL
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '14px', color: '#8c8c8c' }}>WebSocket</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                        ● Connected
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Card title="Actions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={loading}
                    block
                    size="large"
                  >
                    Save Settings
                  </Button>

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    block
                    size="large"
                  >
                    Reset to Defaults
                  </Button>

                  <Divider />

                  <div style={{ 
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #2a2a2a',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#52c41a', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      ✓ Live Data Active
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                      System is using real-time market data with WebSocket streaming
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Settings
