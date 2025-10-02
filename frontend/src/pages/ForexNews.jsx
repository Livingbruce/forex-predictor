import React, { useState } from 'react'
import { Card, List, Tag, Typography, Spin, Alert, Button, Space, Row, Col, Select, Input, DatePicker, Badge, Tooltip } from 'antd'
import { 
  ClockCircleOutlined, 
  ReloadOutlined, 
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  FireOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  EyeOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Search } = Input

const ForexNews = ({ selectedPair }) => {
  const [newsLimit, setNewsLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [impactFilter, setImpactFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)

  // Fetch news for selected pair
  const { data: newsData, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useQuery({
    queryKey: ['news', selectedPair, newsLimit],
    queryFn: () => fetch(`http://localhost:5000/api/news/${encodeURIComponent(selectedPair)}?limit=${newsLimit}`)
      .then(res => res.json()),
    refetchInterval: 10000, // Quiet auto-refresh every 10 seconds
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  // Fetch sentiment analysis
  const { data: sentimentData, isLoading: sentimentLoading, error: sentimentError } = useQuery({
    queryKey: ['sentiment', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/sentiment/${encodeURIComponent(selectedPair)}`)
      .then(res => res.json()),
    refetchInterval: 10000, // Quiet auto-refresh every 10 seconds
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  const getSentimentIcon = (level) => {
    switch (level) {
      case 'Bullish':
      case 'positive':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'Bearish':
      case 'negative':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      case 'Neutral':
      case 'neutral':
        return <MinusOutlined style={{ color: '#1890ff' }} />
      default:
        return <MinusOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getSentimentColor = (level) => {
    switch (level) {
      case 'Bullish':
      case 'positive':
        return 'success'
      case 'Bearish':
      case 'negative':
        return 'error'
      case 'Neutral':
      case 'neutral':
        return 'processing'
      default:
        return 'default'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'green'
      default:
        return 'default'
    }
  }

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'high':
        return <FireOutlined style={{ color: '#ff4d4f' }} />
      case 'medium':
        return <ThunderboltOutlined style={{ color: '#faad14' }} />
      case 'low':
        return <InfoCircleOutlined style={{ color: '#52c41a' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 24) {
      return date.toLocaleDateString()
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      return `${diffMins}m ago`
    }
  }

  // Filter news based on search and filters
  const filteredNews = newsData?.data?.filter(news => {
    const matchesSearch = !searchTerm || 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSentiment = sentimentFilter === 'all' || news.sentiment === sentimentFilter
    const matchesImpact = impactFilter === 'all' || news.impact === impactFilter
    
    return matchesSearch && matchesSentiment && matchesImpact
  }) || []

  // Get news statistics
  const getNewsStats = () => {
    if (!newsData?.data) return null
    
    const total = newsData.data.length
    const positive = newsData.data.filter(n => n.sentiment === 'positive').length
    const negative = newsData.data.filter(n => n.sentiment === 'negative').length
    const neutral = newsData.data.filter(n => n.sentiment === 'neutral').length
    const highImpact = newsData.data.filter(n => n.impact === 'high').length
    
    return { total, positive, negative, neutral, highImpact }
  }

  const stats = getNewsStats()

  if (newsError) {
    return (
      <Alert
        message="Error Loading News"
        description="Failed to load forex news data"
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => refetchNews()}>
            Retry
          </Button>
        }
      />
    )
  }

  return (
    <div className="app-content">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#fff' }}>
          <Space>
            <ThunderboltOutlined />
            Forex News & Analysis
          </Space>
        </Title>
        <Text type="secondary">
          Real-time forex news and market analysis for {selectedPair}
        </Text>
      </div>

      {/* News Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Total News</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {stats.positive}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Positive</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                  {stats.negative}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Negative</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {stats.highImpact}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>High Impact</div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters and Controls */}
      <Card 
        title={
          <Space>
            <FilterOutlined />
            Filters & Search
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Tooltip title="Refresh news data">
              <ReloadOutlined 
                onClick={() => refetchNews()} 
                style={{ cursor: 'pointer', color: '#1890ff' }}
              />
            </Tooltip>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              style={{
                backgroundColor: '#1f1f1f',
                borderColor: '#434343',
                color: '#fff'
              }}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              value={sentimentFilter}
              onChange={setSentimentFilter}
              style={{ 
                width: '100%',
                backgroundColor: '#1f1f1f',
                color: '#fff'
              }}
              placeholder="Sentiment"
              dropdownStyle={{
                backgroundColor: '#1f1f1f',
                borderColor: '#434343'
              }}
            >
              <Option value="all">All Sentiment</Option>
              <Option value="positive">Positive</Option>
              <Option value="negative">Negative</Option>
              <Option value="neutral">Neutral</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              value={impactFilter}
              onChange={setImpactFilter}
              style={{ 
                width: '100%',
                backgroundColor: '#1f1f1f',
                color: '#fff'
              }}
              placeholder="Impact"
              dropdownStyle={{
                backgroundColor: '#1f1f1f',
                borderColor: '#434343'
              }}
            >
              <Option value="all">All Impact</Option>
              <Option value="high">High Impact</Option>
              <Option value="medium">Medium Impact</Option>
              <Option value="low">Low Impact</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              value={newsLimit}
              onChange={setNewsLimit}
              style={{ 
                width: '100%',
                backgroundColor: '#1f1f1f',
                color: '#fff'
              }}
              placeholder="Limit"
              dropdownStyle={{
                backgroundColor: '#1f1f1f',
                borderColor: '#434343'
              }}
            >
              <Option value={10}>10 News</Option>
              <Option value={20}>20 News</Option>
              <Option value={50}>50 News</Option>
              <Option value={100}>100 News</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Market Sentiment Overview */}
      <Card 
        title={
          <Space>
            <EyeOutlined />
            Market Sentiment Overview
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {sentimentLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ marginBottom: 8 }}>Loading market sentiment...</div>
          </div>
        ) : sentimentError ? (
          <Alert
            message="Error Loading Sentiment Data"
            description="Failed to load market sentiment analysis"
            type="error"
            showIcon
          />
        ) : sentimentData?.data ? (
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {getSentimentIcon(sentimentData.data.sentiment)}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {sentimentData.data.sentiment}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Overall Sentiment
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
                  {sentimentData.data.confidence}%
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Confidence Level
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                  {sentimentData.data.volatility}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Market Volatility
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
            <div style={{ fontSize: '12px' }}>Market sentiment data not available</div>
          </div>
        )}
      </Card>

      {/* News List */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            Latest News ({filteredNews.length} articles)
          </Space>
        }
      >
        {newsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading forex news...</div>
          </div>
        ) : (
          <List
            dataSource={filteredNews}
            renderItem={(news) => (
              <List.Item
                key={news.id}
                actions={[
                  <Tooltip title="Time published">
                    <Space>
                      <ClockCircleOutlined />
                      {formatTime(news.timestamp)}
                    </Space>
                  </Tooltip>,
                  <Tooltip title="Source">
                    <Space>
                      <StarOutlined />
                      {news.source}
                    </Space>
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ fontSize: '16px' }}>
                        {news.title}
                      </Text>
                      <Tag color={getSentimentColor(news.sentiment)}>
                        {getSentimentIcon(news.sentiment)}
                        {news.sentiment.toUpperCase()}
                      </Tag>
                      <Tag color={getImpactColor(news.impact)}>
                        {getImpactIcon(news.impact)}
                        {news.impact.toUpperCase()} IMPACT
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph 
                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                        style={{ marginBottom: '8px' }}
                      >
                        {news.content}
                      </Paragraph>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Published: {new Date(news.timestamp).toLocaleString()}
                        </Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} news articles`,
            }}
          />
        )}
      </Card>
    </div>
  )
}

export default ForexNews
