import React, { useState, useEffect } from 'react';
import { chatbotService } from '../../services/chatbot';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './ChatAnalytics.css';

const ChatAnalytics = ({ projectId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/chat/${projectId}?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="chat-analytics">
      <div className="analytics-header">
        <h3>Chat Analytics</h3>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="analytics-grid">
        <div className="metric-card">
          <h4>Total Messages</h4>
          <span className="metric-value">{analytics?.totalMessages || 0}</span>
        </div>
        <div className="metric-card">
          <h4>Active Sessions</h4>
          <span className="metric-value">{analytics?.activeSessions || 0}</span>
        </div>
        <div className="metric-card">
          <h4>Avg Response Time</h4>
          <span className="metric-value">{analytics?.avgResponseTime || 0}s</span>
        </div>
        <div className="metric-card">
          <h4>User Satisfaction</h4>
          <span className="metric-value">{analytics?.satisfaction || 0}%</span>
        </div>
      </div>

      <div className="popular-queries">
        <h4>Popular Queries</h4>
        <div className="queries-list">
          {analytics?.popularQueries?.map((query, index) => (
            <div key={index} className="query-item">
              <span className="query-text">{query.text}</span>
              <span className="query-count">{query.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalytics;
