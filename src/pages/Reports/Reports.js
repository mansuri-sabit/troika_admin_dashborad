import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import './Reports.css';
import api from '../../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState({});
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    reportType: 'usage',
    format: 'csv',
    projectId: 'all'
  });

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/admin/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Projects fetch error:', error);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data;
      switch (filters.reportType) {
        case 'usage':
          data = await analyticsService.getUsageAnalytics(filters.dateRange, filters.projectId !== 'all' ? filters.projectId : null);
          break;
        case 'revenue':
          data = await analyticsService.getRevenueAnalytics(filters.dateRange);
          break;
        case 'projects':
          data = await analyticsService.getProjectAnalytics(filters.projectId, filters.dateRange);
          break;
        default:
          data = await analyticsService.getDashboardAnalytics(filters.dateRange);
      }
      
      setReportData(data);
    } catch (error) {
      setError('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      setExportLoading({ ...exportLoading, [type]: true });
      
      const blob = await analyticsService.exportData(type, filters.format, filters.dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${filters.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Failed to export ${type} report`);
    } finally {
      setExportLoading({ ...exportLoading, [type]: false });
    }
  };

  const reportTypes = [
    { value: 'usage', label: 'Usage Analytics' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'projects', label: 'Project Performance' },
    { value: 'users', label: 'User Activity' }
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const exportFormats = [
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'pdf', label: 'PDF' }
  ];

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>Reports & Export</h1>
        <p>Generate comprehensive reports and export data</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="reports-container">
        <div className="report-filters">
          <h3>Report Configuration</h3>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Project</label>
              <select
                value={filters.projectId}
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Export Format</label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              >
                {exportFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <Button 
              onClick={generateReport} 
              loading={loading}
              variant="primary"
            >
              Generate Report
            </Button>
          </div>
        </div>

        <div className="quick-exports">
          <h3>Quick Exports</h3>
          <div className="export-buttons">
            <Button
              variant="outline"
              onClick={() => exportReport('usage')}
              loading={exportLoading.usage}
            >
              📊 Export Usage Data
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('projects')}
              loading={exportLoading.projects}
            >
              📁 Export Projects
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('users')}
              loading={exportLoading.users}
            >
              👥 Export Users
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('revenue')}
              loading={exportLoading.revenue}
            >
              💰 Export Revenue
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('messages')}
              loading={exportLoading.messages}
            >
              💬 Export Messages
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('analytics')}
              loading={exportLoading.analytics}
            >
              📈 Export Analytics
            </Button>
          </div>
        </div>

        {reportData && (
          <div className="report-preview">
            <h3>Report Preview</h3>
            <div className="preview-content">
              {filters.reportType === 'usage' && (
                <div className="usage-report">
                  <div className="report-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Messages</span>
                      <span className="summary-value">{reportData.metrics?.total_messages?.toLocaleString() || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Tokens</span>
                      <span className="summary-value">{reportData.metrics?.total_tokens?.toLocaleString() || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Cost</span>
                      <span className="summary-value">${reportData.metrics?.total_cost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Success Rate</span>
                      <span className="summary-value">{reportData.metrics?.success_rate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                  
                  {reportData.daily_breakdown && (
                    <div className="daily-breakdown">
                      <h4>Daily Breakdown</h4>
                      <div className="breakdown-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Messages</th>
                              <th>Tokens</th>
                              <th>Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.daily_breakdown.slice(0, 10).map((day, index) => (
                              <tr key={index}>
                                <td>{new Date(day.date).toLocaleDateString()}</td>
                                <td>{day.messages?.toLocaleString() || 0}</td>
                                <td>{day.tokens?.toLocaleString() || 0}</td>
                                <td>${day.cost?.toFixed(2) || '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {filters.reportType === 'revenue' && (
                <div className="revenue-report">
                  <div className="report-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Revenue</span>
                      <span className="summary-value">${reportData.total_revenue?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Monthly Recurring</span>
                      <span className="summary-value">${reportData.mrr?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Growth Rate</span>
                      <span className="summary-value">{reportData.growth_rate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="export-actions">
                <Button
                  variant="primary"
                  onClick={() => exportReport(filters.reportType)}
                  loading={exportLoading[filters.reportType]}
                >
                  Export This Report
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="scheduled-reports">
          <h3>Scheduled Reports</h3>
          <p>Set up automated report generation and delivery</p>
          
          <div className="schedule-options">
            <div className="schedule-item">
              <div className="schedule-info">
                <h4>Weekly Usage Report</h4>
                <p>Automated weekly usage analytics delivered every Monday</p>
              </div>
              <Button variant="outline" size="small">
                Configure
              </Button>
            </div>
            
            <div className="schedule-item">
              <div className="schedule-info">
                <h4>Monthly Revenue Report</h4>
                <p>Monthly revenue and billing summary on the 1st of each month</p>
              </div>
              <Button variant="outline" size="small">
                Configure
              </Button>
            </div>
            
            <div className="schedule-item">
              <div className="schedule-info">
                <h4>Project Performance Report</h4>
                <p>Quarterly project performance analysis and recommendations</p>
              </div>
              <Button variant="outline" size="small">
                Configure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
