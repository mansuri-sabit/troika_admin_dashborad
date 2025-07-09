import api from './api';

export const clientsService = {
  getClients: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/clients?page=${page}&limit=${limit}`);
    return response.data;
  },

  getClient: async (id) => {
    const response = await api.get(`/admin/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/admin/clients', clientData);
    return response.data;
  },

  updateClient: async (id, data) => {
    const response = await api.patch(`/admin/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await api.delete(`/admin/clients/${id}`);
    return response.data;
  },

  getClientStats: async (id) => {
    const response = await api.get(`/admin/clients/${id}/stats`);
    return response.data;
  },

  getClientProjects: async (id) => {
    const response = await api.get(`/admin/clients/${id}/projects`);
    return response.data;
  },

  suspendClient: async (id) => {
    const response = await api.post(`/admin/clients/${id}/suspend`);
    return response.data;
  },

  activateClient: async (id) => {
    const response = await api.post(`/admin/clients/${id}/activate`);
    return response.data;
  }
};
