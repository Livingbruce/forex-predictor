import React, { useState, useEffect } from 'react'
import { Card, Progress, List, Tag, Typography, Space, Button, Tooltip, Alert } from 'antd'
import { 
  RobotOutlined, 
  BulbOutlined, 
  TrophyOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'

const { Title, Text } = Typography

const MLPanel = ({ selectedPair }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Fetch ML patterns and learning data
  const { data: mlData, isLoading: mlLoading, error: mlError, refetch: refetchML } = useQuery({
    queryKey: ['ml-patterns'],
    queryFn: () => fetch('http://localhost:5000/api/ml/patterns')
      .then(res => res.json()),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  })

  // Fetch current signal with ML enhancement
  const { data: signalData, isLoading: signalLoading } = useQuery({
    queryKey: ['ml-signal', selectedPair],
    queryFn: () => fetch(`http://localhost:5000/api/signals/${encodeURIComponent(selectedPair)}`)
      .then(res => res.json()),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  const submitFeedback = async (success) => {
    try {
      await fetch('http://localhost:5000/api/ml/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          predictionId: Date.now(),
          success: success,
          actualOutcome: success ? 'correct' : 'incorrect'
        })
      })
      
      setFeedbackSubmitted(true)
      setTimeout(() => setFeedbackSubmitted(false), 3000)
      refetchML()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const getPatternIcon = (type) => {
    switch (type) {
      case 'double_top':
        return '📈📉'
      case 'double_bottom':
        return '📉📈'
      case 'head_shoulders':
        return '👤'
      case 'ascending_triangle':
        return '🔺'
      case 'descending_triangle':
        return '🔻'
      default:
        return '📊'
    }
  }

  const getPatternColor = (type) => {
    switch (type) {
      case 'double_top':
      case 'descending_triangle':
      case 'head_shoulders':
        return 'red'
      case 'double_bottom':
      case 'ascending_triangle':
        return 'green'
      default:
        return 'blue'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#52c41a'
    if (confidence >= 0.6) return '#faad14'
    return '#ff4d4f'
  }

  if (mlError) {
    return (
      <Alert
        message="Error Loading ML Data"
        description="Failed to load machine learning data"
        type="error"
        showIcon
      />
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* ML Enhancement Status */}
      <Card 
        title={
          <Space>
            <RobotOutlined />
            AI Pattern Recognition
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Tooltip title="Machine learning analyzes price patterns to enhance trading signals">
              <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
            <ReloadOutlined 
              onClick={() => refetchML()} 
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
          </Space>
        }
      >
        {signalLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ marginBottom: 8 }}>Analyzing patterns...</div>
          </div>
        ) : signalData && signalData.mlEnhancement ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <BulbOutlined style={{ color: '#1890ff' }} />
                <Text strong>ML Score: {signalData.mlEnhancement.mlScore}%</Text>
              </Space>
              <Tag color={signalData.mlEnhancement.mlScore > 50 ? 'green' : 'orange'}>
                {signalData.mlEnhancement.mlScore > 50 ? 'High Confidence' : 'Learning'}
              </Tag>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <Text>{signalData.mlEnhancement.recommendation}</Text>
            </div>
            
            {signalData.mlEnhancement.patterns.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">Detected Patterns:</Text>
                <div style={{ marginTop: 4 }}>
                  {signalData.mlEnhancement.patterns.map((pattern, index) => (
                    <Tag 
                      key={index} 
                      color={getPatternColor(pattern.type)}
                      style={{ marginBottom: 4 }}
                    >
                      {getPatternIcon(pattern.type)} {pattern.type.replace('_', ' ')}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8c8c8c' }}>
              <span>Learning Data: {signalData.mlEnhancement.learningData} samples</span>
              <span>Enhanced Confidence: {Math.round(signalData.mlEnhancement.confidence)}%</span>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Pattern Learning Status */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            Pattern Learning Status
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {mlLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ marginBottom: 8 }}>Loading ML data...</div>
          </div>
        ) : mlData && mlData.patterns ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Pattern Success Rates:</Text>
            </div>
            
            {mlData.patterns.map((pattern) => (
              <div key={pattern.type} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Space>
                    <span>{getPatternIcon(pattern.type)}</span>
                    <Text strong style={{ textTransform: 'capitalize' }}>
                      {pattern.type.replace('_', ' ')}
                    </Text>
                  </Space>
                  <Text style={{ color: getConfidenceColor(pattern.confidence) }}>
                    {Math.round(pattern.successRate)}%
                  </Text>
                </div>
                <Progress
                  percent={pattern.successRate}
                  strokeColor={getConfidenceColor(pattern.confidence)}
                  size="small"
                  showInfo={false}
                />
                <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 2 }}>
                  {pattern.successes}/{pattern.total} successful predictions
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: 16, padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Total Learning Samples: {mlData.learningData}
              </Text>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No ML data available</div>
            <div style={{ fontSize: '12px' }}>Pattern learning will begin as data is collected</div>
          </div>
        )}
      </Card>

      {/* Feedback Section */}
      <Card 
        title="Help AI Learn"
        size="small"
        extra={
          feedbackSubmitted && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Feedback Submitted
            </Tag>
          )
        }
      >
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px', marginBottom: 8, display: 'block' }}>
            Was the last prediction accurate?
          </Text>
          <Space>
            <Button 
              size="small" 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={() => submitFeedback(true)}
              disabled={feedbackSubmitted}
            >
              Correct
            </Button>
            <Button 
              size="small" 
              danger 
              icon={<CloseCircleOutlined />}
              onClick={() => submitFeedback(false)}
              disabled={feedbackSubmitted}
            >
              Incorrect
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default MLPanel
