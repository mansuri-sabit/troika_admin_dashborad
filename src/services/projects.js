import api from './api';

export const projectsService = {
  getProjects: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/admin/projects?page=${page}&limit=${limit}`);
      
      // Handle different response structures
      let projects = [];
      if (response.data.projects) {
        projects = response.data.projects;
      } else if (Array.isArray(response.data)) {
        projects = response.data;
      } else if (response.data.data) {
        projects = response.data.data;
      }
      
      // Ensure each project has a valid ID
      projects = projects.map((project, index) => ({
        ...project,
        id: project.id || project._id || project.project_id || `temp-${index}`
      }));
      
      return {
        projects: projects,
        total: response.data.total || projects.length
      };
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return { projects: [], total: 0 };
    }
  },

  getProject: async (id) => {
    try {
      if (!id) {
        throw new Error('Invalid project ID');
      }
      const response = await api.get(`/admin/projects/${id}`);
      
      let project = null;
      if (response.data.project) {
        project = response.data.project;
      } else if (response.data.data) {
        project = response.data.data;
      } else {
        project = response.data;
      }
      
      return { project };
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  },

  createProject: async (formData) => {
    const response = await api.post('/admin/projects', formData);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await api.patch(`/admin/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/admin/projects/${id}`);
    return response.data;
  },

  updateProjectStatus: async (id, status) => {
    const response = await api.patch(`/admin/projects/${id}/status`, { status });
    return response.data;
  },

  renewProject: async (id, duration) => {
    const response = await api.post(`/admin/projects/${id}/renew`, { duration });
    return response.data;
  },

  uploadFiles: async (id, formData) => {
    const response = await api.post(`/admin/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteFile: async (id, fileId) => {
    const response = await api.delete(`/admin/projects/${id}/files/${fileId}`);
    return response.data;
  },

  getProjectUsage: async (id) => {
    const response = await api.get(`/admin/projects/${id}/usage`);
    return response.data;
  },

   // 🔥 Add this new method for file uploads
  createProjectWithFiles: async (formData) => {
    try {
      // Create a custom axios instance for file uploads
      const response = await axios.post(
        'https://completetroikabackend.onrender.com/api/admin/projects',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 30000, // 30 seconds for file uploads
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create project with files:', error);
      throw error;
    }
  },
};

export default projectsService;
