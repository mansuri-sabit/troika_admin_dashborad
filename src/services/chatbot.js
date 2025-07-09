import api from './api';

export const chatbotService = {
  createSession: async (projectId) => {
    try {
      const response = await api.post('/chatbot/session', { projectId });
      return response.data;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  },

  sendMessage: async ({ sessionId, projectId, message }) => {
    try {
      const response = await api.post('/chatbot/message', {
        sessionId,
        projectId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  getSessionHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/session/${sessionId}/history`);
      return response.data;
    } catch (error) {
      console.error('Get session history error:', error);
      throw error;
    }
  },

  endSession: async (sessionId) => {
    try {
      const response = await api.post(`/chatbot/session/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error('End session error:', error);
      throw error;
    }
  },

  getProjectConfig: async (projectId) => {
    try {
      const response = await api.get(`/chatbot/project/${projectId}/config`);
      return response.data;
    } catch (error) {
      console.error('Get project config error:', error);
      throw error;
    }
  }
};
