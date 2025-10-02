import React, { useState, useEffect } from 'react'
import { Card, List, Tag, Typography, Spin, Alert, Button, Space } from 'antd'
import { 
  ClockCircleOutlined, 
  ReloadOutlined, 
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  FireOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'

const { Title, Text } = Typography

const NewsPanel = ({ selectedPair }) => {
  const [newsLimit, setNewsLimit] = useState(5)

  // Fetch news for selected pair
  const { data: newsData, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useQuery({
    queryKey: ['news', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/news/${encodeURIComponent(selectedPair)}?limit=${newsLimit}`)
      .then(res => res.json()),
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  })

  // Fetch sentiment analysis
  const { data: sentimentData, isLoading: sentimentLoading, error: sentimentError } = useQuery({
    queryKey: ['sentiment', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/sentiment/${encodeURIComponent(selectedPair)}`)
      .then(res => res.json()),
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  })

  const getSentimentIcon = (level) => {
    switch (level) {
      case 'Bullish':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'Bearish':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      case 'Neutral':
        return <MinusOutlined style={{ color: '#1890ff' }} />
      default:
        return <MinusOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getSentimentColor = (level) => {
    switch (level) {
      case 'Bullish':
        return '#52c41a'
      case 'Bearish':
        return '#ff4d4f'
      case 'Neutral':
        return '#1890ff'
      default:
        return '#1890ff'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'red'
      case 'Medium':
        return 'orange'
      default:
        return 'green'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (newsError || sentimentError) {
    return (
      <Alert
        message="Error Loading News"
        description="Failed to load news and sentiment data"
        type="error"
        showIcon
      />
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Sentiment Analysis */}
      <Card 
        title={
          <Space>
            <InfoCircleOutlined />
            Market Sentiment
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={() => {
              refetchNews()
              // Refetch sentiment would be handled by react-query
            }}
          >
            Refresh
          </Button>
        }
      >
        {sentimentLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>Loading sentiment...</div>
          </div>
        ) : sentimentData && sentimentData.overallSentiment ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              {getSentimentIcon(sentimentData.overallSentiment === 'positive' ? 'Bullish' : sentimentData.overallSentiment === 'negative' ? 'Bearish' : 'Neutral')}
              <Title level={4} style={{ margin: '0 0 0 8px', color: getSentimentColor(sentimentData.overallSentiment === 'positive' ? 'Bullish' : sentimentData.overallSentiment === 'negative' ? 'Bearish' : 'Neutral') }}>
                {sentimentData.overallSentiment === 'positive' ? 'Bullish' : sentimentData.overallSentiment === 'negative' ? 'Bearish' : 'Neutral'}
              </Title>
              <Text style={{ marginLeft: 8, fontSize: '16px', fontWeight: 'bold' }}>
                {Math.round((sentimentData.confidence || 0.5) * 100)}%
              </Text>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <Text>Market sentiment analysis based on economic indicators and news</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Positive: </Text>
                <Text strong style={{ color: '#52c41a' }}>{(sentimentData.positive || 0).toFixed(1)}%</Text>
              </div>
              <div>
                <Text type="secondary">Negative: </Text>
                <Text strong style={{ color: '#ff4d4f' }}>{(sentimentData.negative || 0).toFixed(1)}%</Text>
              </div>
              <div>
                <Text type="secondary">Neutral: </Text>
                <Text strong style={{ color: '#8c8c8c' }}>{(sentimentData.neutral || 0).toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
            No sentiment data available
          </div>
        )}
      </Card>

      {/* News Feed */}
      <Card 
        title={
          <Space>
            <FireOutlined />
            Latest News - {selectedPair}
          </Space>
        }
        extra={
          <Space>
            <Button 
              size="small" 
              onClick={() => setNewsLimit(newsLimit === 5 ? 10 : 5)}
            >
              {newsLimit === 5 ? 'Show More' : 'Show Less'}
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              onClick={() => refetchNews()}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {newsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>Loading news...</div>
          </div>
        ) : newsData && newsData.news && Array.isArray(newsData.news) ? (
          <List
            dataSource={newsData.news}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text strong style={{ flex: 1, marginRight: 8 }}>
                        {item?.title || 'No title'}
                      </Text>
                      <Space size="small">
                        <Tag color={getImpactColor(item?.impact || 'Low')}>
                          {item?.impact || 'Low'}
                        </Tag>
                        <Tag color={getSentimentColor(item?.sentiment === 'positive' ? 'Bullish' : item?.sentiment === 'negative' ? 'Bearish' : 'Neutral')}>
                          {item?.sentiment || 'neutral'}
                        </Tag>
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <ClockCircleOutlined /> {formatTime(item?.timestamp || Date.now())} • {item?.source || 'Unknown'}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text>{item?.content || 'No content available'}</Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
            No news available for {selectedPair}
          </div>
        )}
      </Card>
    </div>
  )
}

export default NewsPanel

