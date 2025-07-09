import api from './api';

export const analyticsService = {
  getDashboardAnalytics: async (timeRange = '7d') => {
    const response = await api.get(`/admin/analytics/dashboard?range=${timeRange}`);
    return response.data;
  },

  getUsageAnalytics: async (timeRange = '7d', projectId = null) => {
    const params = new URLSearchParams({ range: timeRange });
    if (projectId) params.append('project_id', projectId);
    
    const response = await api.get(`/admin/analytics/usage?${params}`);
    return response.data;
  },

  getRevenueAnalytics: async (timeRange = '30d') => {
    const response = await api.get(`/admin/analytics/revenue?range=${timeRange}`);
    return response.data;
  },

  getProjectAnalytics: async (projectId, timeRange = '7d') => {
    const response = await api.get(`/admin/analytics/projects/${projectId}?range=${timeRange}`);
    return response.data;
  },

  exportData: async (type, format = 'csv', timeRange = '30d') => {
    const response = await api.get(`/admin/export/${type}?format=${format}&range=${timeRange}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
