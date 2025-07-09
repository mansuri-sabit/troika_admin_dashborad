import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const projects = dashboardData?.projects || [];
  const notifications = dashboardData?.notifications || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Troika Tech Admin Dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalProjects || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeProjects || 0}</h3>
            <p>Active Projects</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.monthlyRevenue || 0}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔤</div>
          <div className="stat-content">
            <h3>{stats.tokensUsed || 0}</h3>
            <p>Tokens Used</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📞</div>
          <div className="stat-content">
            <h3>{stats.apiCalls || 0}</h3>
            <p>API Calls</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-projects">
          <h2>Recent Projects</h2>
          <div className="projects-list">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <p className={`status ${project.status}`}>
                      {project.status}
                    </p>
                  </div>
                  <div className="project-stats">
                    <div className="usage-bar">
                      <div 
                        className="usage-fill"
                        style={{ 
                          width: `${(project.total_tokens_used / project.monthly_token_limit) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="usage-text">
                      {project.total_tokens_used} / {project.monthly_token_limit} tokens
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No projects found</p>
            )}
          </div>
        </div>

        <div className="notifications">
          <h2>Notifications</h2>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
