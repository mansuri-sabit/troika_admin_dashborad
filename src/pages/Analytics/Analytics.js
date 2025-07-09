import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedProject, setSelectedProject] = useState('all');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
    fetchProjects();
  }, [timeRange, selectedProject]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        range: timeRange,
        ...(selectedProject !== 'all' && { project_id: selectedProject })
      });
      
      const response = await api.get(`/admin/analytics/usage?${params}`);
      setAnalyticsData(response.data);
    } catch (error) {
      setError('Failed to fetch analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/admin/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Projects fetch error:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchAnalyticsData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const metrics = analyticsData?.metrics || {};
  const dailyBreakdown = analyticsData?.daily_breakdown || [];
  const topProjects = analyticsData?.top_projects || [];
  const usageByModel = analyticsData?.usage_by_model || [];

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Analytics & Reports</h1>
        <p>Comprehensive insights into your chatbot platform performance</p>
      </div>

      <div className="analytics-filters">
        <div className="filter-group">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Project:</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-content">
            <h3>{formatNumber(metrics.total_messages || 0)}</h3>
            <p>Total Messages</p>
            <span className="metric-change positive">
              +{metrics.messages_growth || 0}% vs last period
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔤</div>
          <div className="metric-content">
            <h3>{formatNumber(metrics.total_tokens || 0)}</h3>
            <p>Tokens Consumed</p>
            <span className="metric-change positive">
              +{metrics.tokens_growth || 0}% vs last period
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>{formatCurrency(metrics.total_cost || 0)}</h3>
            <p>Total Cost</p>
            <span className="metric-change negative">
              +{metrics.cost_growth || 0}% vs last period
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>{metrics.avg_response_time || 0}s</h3>
            <p>Avg Response Time</p>
            <span className="metric-change positive">
              -{metrics.response_time_improvement || 0}% vs last period
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{metrics.success_rate || 0}%</h3>
            <p>Success Rate</p>
            <span className="metric-change positive">
              +{metrics.success_rate_improvement || 0}% vs last period
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{formatNumber(metrics.unique_users || 0)}</h3>
            <p>Unique Users</p>
            <span className="metric-change positive">
              +{metrics.users_growth || 0}% vs last period
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Daily Usage Trend</h3>
          <div className="chart-container">
            <div className="line-chart">
              {dailyBreakdown.map((day, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(day.messages / Math.max(...dailyBreakdown.map(d => d.messages))) * 100}%` 
                    }}
                  ></div>
                  <span className="bar-label">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Performing Projects</h3>
          <div className="ranking-list">
            {topProjects.map((project, index) => (
              <div key={project.id} className="ranking-item">
                <div className="rank-number">{index + 1}</div>
                <div className="project-info">
                  <span className="project-name">{project.name}</span>
                  <span className="project-stats">
                    {formatNumber(project.total_messages)} messages
                  </span>
                </div>
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${(project.total_messages / topProjects[0]?.total_messages) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Model Usage Distribution</h3>
          <div className="pie-chart-container">
            <div className="model-stats">
              {usageByModel.map((model, index) => (
                <div key={model.model} className="model-stat">
                  <div className="model-indicator" style={{ backgroundColor: getModelColor(index) }}></div>
                  <span className="model-name">{model.model}</span>
                  <span className="model-percentage">{model.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Cost Breakdown</h3>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span className="cost-label">OpenAI API</span>
              <span className="cost-value">{formatCurrency(metrics.openai_cost || 0)}</span>
              <span className="cost-percentage">
                {((metrics.openai_cost || 0) / (metrics.total_cost || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Gemini API</span>
              <span className="cost-value">{formatCurrency(metrics.gemini_cost || 0)}</span>
              <span className="cost-percentage">
                {((metrics.gemini_cost || 0) / (metrics.total_cost || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Infrastructure</span>
              <span className="cost-value">{formatCurrency(metrics.infrastructure_cost || 0)}</span>
              <span className="cost-percentage">
                {((metrics.infrastructure_cost || 0) / (metrics.total_cost || 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-stats">
        <div className="stats-card">
          <h3>Performance Metrics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Peak Hour Usage</label>
              <span>{metrics.peak_hour || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <label>Average Session Duration</label>
              <span>{metrics.avg_session_duration || 0} minutes</span>
            </div>
            <div className="stat-item">
              <label>Error Rate</label>
              <span>{metrics.error_rate || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Most Active Day</label>
              <span>{metrics.most_active_day || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3>Usage Patterns</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Avg Messages per Session</label>
              <span>{metrics.avg_messages_per_session || 0}</span>
            </div>
            <div className="stat-item">
              <label>Returning Users</label>
              <span>{metrics.returning_users_percentage || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Mobile Usage</label>
              <span>{metrics.mobile_usage_percentage || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Top Referrer</label>
              <span>{metrics.top_referrer || 'Direct'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getModelColor = (index) => {
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
  return colors[index % colors.length];
};

export default Analytics;
