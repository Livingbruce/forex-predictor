import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Spin, Alert, Button, Space, Tooltip, Tag, List, Progress, Statistic } from 'antd'
import { 
  RobotOutlined, 
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined, 
  InfoCircleOutlined,
  ReloadOutlined,
  FireOutlined,
  EyeOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { fetchMLPatterns, fetchMLFeedback } from '../services/apiService'

const { Title, Text } = Typography

const AIPatternRecognitionPage = ({ selectedPair }) => {
  const [feedbackData, setFeedbackData] = useState({})

  const { data: patternsData, isLoading: patternsLoading, error: patternsError, refetch: refetchPatterns } = useQuery({
    queryKey: ['mlPatterns', selectedPair],
    queryFn: () => fetchMLPatterns(selectedPair),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  })

  const { data: learningData, isLoading: learningLoading, error: learningError, refetch: refetchLearning } = useQuery({
    queryKey: ['mlLearning', selectedPair],
    queryFn: () => fetchMLFeedback(selectedPair),
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  })

  const getPatternIcon = (pattern) => {
    if (!pattern || typeof pattern !== 'string') {
      console.warn('Invalid pattern for icon:', pattern)
      return <EyeOutlined style={{ color: '#1890ff' }} />
    }
    
    switch (pattern.toLowerCase()) {
      case 'double top':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      case 'double bottom':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'head and shoulders':
      case 'head & shoulders':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      case 'ascending triangle':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'descending triangle':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <EyeOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getPatternColor = (pattern) => {
    if (!pattern || typeof pattern !== 'string') {
      console.warn('Invalid pattern for color:', pattern)
      return '#1890ff' // fallback color
    }
    
    switch (pattern.toLowerCase()) {
      case 'double top':
      case 'head and shoulders':
      case 'head & shoulders':
      case 'descending triangle':
        return '#ff4d4f'
      case 'double bottom':
      case 'ascending triangle':
        return '#52c41a'
      default:
        return '#1890ff'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#52c41a'
    if (confidence >= 60) return '#faad14'
    if (confidence >= 40) return '#ff7875'
    return '#ff4d4f'
  }

  const handleFeedback = (patternId, isCorrect) => {
    setFeedbackData(prev => ({
      ...prev,
      [patternId]: isCorrect
    }))
    
    // Send feedback to ML system
    fetchMLFeedback(selectedPair, { patternId, isCorrect })
      .then(() => {
        refetchLearning()
      })
      .catch(error => {
        console.error('Failed to send feedback:', error)
      })
  }

  const handleRefresh = () => {
    refetchPatterns()
    refetchLearning()
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <Title level={2}>AI Pattern Recognition</Title>
        <Text type="secondary">
          Advanced machine learning pattern detection and analysis for {selectedPair}
        </Text>
      </div>

      {(patternsError || learningError) && (
        <Alert
          message="Error"
          description={`Failed to fetch AI data: ${patternsError?.message || learningError?.message}`}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {(patternsLoading || learningLoading) ? (
        <div className="loading-container">
          <Spin size="large" />
          <span className="loading-text">Loading AI pattern recognition data...</span>
        </div>
      ) : (
        <>
          {/* AI Learning Statistics */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card 
                style={{ 
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                styles={{
                  body: { padding: '20px', textAlign: 'center' }
                }}
              >
                <RobotOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Patterns Detected</span>}
                  value={patternsData?.patterns?.length || 0}
                  valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={8}>
              <Card 
                style={{ 
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                styles={{
                  body: { padding: '20px', textAlign: 'center' }
                }}
              >
                <BulbOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Learning Data Points</span>}
                  value={learningData?.learningCount || 0}
                  valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={8}>
              <Card 
                style={{ 
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                styles={{
                  body: { padding: '20px', textAlign: 'center' }
                }}
              >
                <FireOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Accuracy Rate</span>}
                  value={learningData?.accuracy || 0}
                  suffix="%"
                  valueStyle={{ color: '#faad14', fontSize: '24px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Detected Patterns */}
          <Card 
            title={
              <Space>
                <EyeOutlined style={{ color: '#1890ff' }} />
                <span>Detected Patterns</span>
              </Space>
            }
            extra={
              <Space>
                <Tooltip title="How AI Pattern Recognition Works">
                  <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                </Tooltip>
                <Tooltip title="Refresh Pattern Analysis">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh} 
                    type="text" 
                    style={{ color: '#fff' }}
                  />
                </Tooltip>
              </Space>
            }
            style={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              marginBottom: 24
            }}
            styles={{
              header: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderBottom: '1px solid #2a2a2a',
                color: '#fff'
              },
              body: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                padding: '20px'
              }
            }}
          >
            {patternsData?.patterns?.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={Array.isArray(patternsData.patterns) ? patternsData.patterns : []}
                renderItem={(pattern, index) => {
                  // Defensive checks for pattern data
                  if (!pattern) {
                    console.warn('Invalid pattern item:', pattern)
                    return null
                  }
                  
                  const patternType = pattern.type || pattern.name || 'Unknown Pattern'
                  const patternId = pattern.id || `pattern-${index}`
                  const confidence = pattern.confidence || 0
                  const successRate = pattern.successRate || 0
                  
                  return (
                    <List.Item style={{ 
                      borderBottom: '1px dashed #2a2a2a', 
                      padding: '16px 0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          background: getPatternColor(patternType),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px',
                          boxShadow: `0 2px 8px ${getPatternColor(patternType)}30`
                        }}>
                          {getPatternIcon(patternType)}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <Text strong style={{ color: '#fff', fontSize: '16px', marginRight: '8px' }}>
                              {patternType}
                            </Text>
                            <Tag color={getPatternColor(patternType)} style={{ marginRight: '8px' }}>
                              {patternType}
                            </Tag>
                            <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              Success Rate: {successRate}%
                            </Text>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <Text style={{ color: '#8c8c8c', fontSize: '14px', marginRight: '12px' }}>
                              Confidence:
                            </Text>
                            <Progress 
                              percent={confidence} 
                              size="small" 
                              showInfo={false} 
                              strokeColor={getConfidenceColor(confidence)}
                              trailColor="#2a2a2a"
                              style={{ width: '100px', marginRight: '8px' }}
                            />
                            <Text style={{ 
                              color: getConfidenceColor(confidence), 
                              fontWeight: '600',
                              fontSize: '14px'
                            }}>
                              {confidence}%
                            </Text>
                          </div>
                          
                          <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            {pattern.description || `AI detected ${patternType} pattern with ${confidence}% confidence`}
                          </Text>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Tooltip title="Pattern was correct">
                            <Button 
                              type="text" 
                              icon={<ArrowUpOutlined />}
                              onClick={() => handleFeedback(patternId, true)}
                              style={{ 
                                color: '#52c41a',
                                border: feedbackData[patternId] === true ? '1px solid #52c41a' : 'none'
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Pattern was incorrect">
                            <Button 
                              type="text" 
                              icon={<ArrowDownOutlined />}
                              onClick={() => handleFeedback(patternId, false)}
                              style={{ 
                                color: '#ff4d4f',
                                border: feedbackData[patternId] === false ? '1px solid #ff4d4f' : 'none'
                              }}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </List.Item>
                  )
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                <EyeOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>No patterns detected</div>
                <div style={{ fontSize: '12px' }}>AI is analyzing market data for pattern recognition...</div>
              </div>
            )}
          </Card>

          {/* AI Learning Progress */}
          <Card 
            title={
              <Space>
                <BulbOutlined style={{ color: '#52c41a' }} />
                <span>AI Learning Progress</span>
              </Space>
            }
            style={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            styles={{
              header: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderBottom: '1px solid #2a2a2a',
                color: '#fff'
              },
              body: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                padding: '20px'
              }
            }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>Overall Learning Progress</Text>
                  <Progress 
                    percent={learningData?.learningProgress || 0} 
                    strokeColor="#52c41a"
                    trailColor="#2a2a2a"
                    style={{ marginTop: '8px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>Pattern Recognition Accuracy</Text>
                  <Progress 
                    percent={learningData?.accuracy || 0} 
                    strokeColor="#1890ff"
                    trailColor="#2a2a2a"
                    style={{ marginTop: '8px' }}
                  />
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#0e0e0e', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a'
                }}>
                  <Title level={5} style={{ color: '#fff', marginBottom: '12px' }}>Learning Insights</Title>
                  <div style={{ color: '#8c8c8c', fontSize: '14px', lineHeight: '1.6' }}>
                    {learningData?.insights || 'AI is continuously learning from market patterns and user feedback to improve prediction accuracy.'}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  )
}

export default AIPatternRecognitionPage
