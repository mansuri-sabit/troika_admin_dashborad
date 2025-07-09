import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsService } from '../../services/projects';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import './ProjectList.css';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const projectsPerPage = 10;

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await projectsService.getProjects(currentPage, projectsPerPage);
      
      if (!response) {
        setError('No response from server');
        return;
      }
      
      let filteredProjects = response.projects || [];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredProjects = filteredProjects.filter(project => project.status === statusFilter);
      }
      
      setProjects(filteredProjects);
      setTotalProjects(response.total || filteredProjects.length);
      setTotalPages(Math.ceil((response.total || filteredProjects.length) / projectsPerPage));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const getProjectId = (project) => {
    return project.id || project._id || project.project_id || project.ID || null;
  };

  const getFilteredProjects = () => {
    if (!searchTerm) return projects;
    
    return projects.filter(project =>
      (project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.project_id && project.project_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.client_email && project.client_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'suspended': return '#dc3545';
      case 'expired': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getUsagePercentage = (project) => {
    if (!project || !project.monthly_token_limit || project.monthly_token_limit === 0) return 0;
    return Math.min((project.total_tokens_used / project.monthly_token_limit) * 100, 100);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleQuickAction = async (projectId, action) => {
    if (!projectId) {
      setError('Invalid project ID');
      return;
    }

    try {
      switch (action) {
        case 'suspend':
          await projectsService.updateProjectStatus(projectId, 'suspended');
          break;
        case 'activate':
          await projectsService.updateProjectStatus(projectId, 'active');
          break;
        case 'renew':
          await projectsService.renewProject(projectId, 12);
          break;
        default:
          return;
      }
      fetchProjects();
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
      setError(`Failed to ${action} project`);
    }
  };

  const handleProjectNavigation = (projectId) => {
    if (!projectId) {
      setError('Invalid project ID');
      return;
    }
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <div className="projects-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="projects-list">
      <div className="projects-header">
        <div className="header-left">
          <h1>Projects</h1>
          <p>Manage all projects</p>
        </div>
        <Button onClick={() => navigate('/projects/create')}>Create New Project</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="projects-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="projects-stats">
        <div className="stat-item">
          <span className="stat-number">{totalProjects}</span>
          <span className="stat-label">Total Projects</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.filter(p => p.status === 'active').length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.filter(p => p.status === 'suspended').length}</span>
          <span className="stat-label">Suspended</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.filter(p => p.status === 'expired').length}</span>
          <span className="stat-label">Expired</span>
        </div>
      </div>

      <div className="projects-table">
        {filteredProjects.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Expiry</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => {
                const projectId = getProjectId(project) || `temp-${index}`;
                return (
                  <tr key={projectId}>
                    <td>
                      <Link
                        to={`/projects/${projectId}`}
                        className="project-name"
                        onClick={(e) => {
                          if (!projectId) {
                            e.preventDefault();
                            setError('Invalid project ID');
                          }
                        }}
                      >
                        {project.name || 'Unnamed Project'}
                      </Link>
                      <div className="project-meta">
                        <span className="project-id">{project.project_id || 'N/A'}</span>
                        {project.client_email && <span className="client-email">{project.client_email}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(project.status) }}>
                        {project.status || 'unknown'}
                      </span>
                    </td>
                    <td>
                      <div className="usage-info">
                        <div className="usage-bar">
                          <div className="usage-fill" style={{ width: `${getUsagePercentage(project)}%` }}></div>
                        </div>
                        <span className="usage-text">
                          {(project.total_tokens_used || 0).toLocaleString()} / {(project.monthly_token_limit || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="expiry-info">
                        <span className="expiry-date">{project.expiry_date ? new Date(project.expiry_date).toLocaleDateString() : 'N/A'}</span>
                        {project.expiry_date && (
                          <span className={`days-remaining ${getDaysUntilExpiry(project.expiry_date) <= 7 ? 'warning' : ''}`}>
                            {getDaysUntilExpiry(project.expiry_date)} days
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => handleProjectNavigation(projectId)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {project.status === 'active' ? (
                          <button
                            className="action-btn suspend"
                            onClick={() => handleQuickAction(projectId, 'suspend')}
                            title="Suspend"
                          >
                            ⏸️
                          </button>
                        ) : (
                          <button
                            className="action-btn activate"
                            onClick={() => handleQuickAction(projectId, 'activate')}
                            title="Activate"
                          >
                            ▶️
                          </button>
                        )}
                        <button
                          className="action-btn renew"
                          onClick={() => handleQuickAction(projectId, 'renew')}
                          title="Renew"
                        >
                          🔄
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-projects">
            <div className="no-projects-content">
              <span className="no-projects-icon">📁</span>
              <h3>No projects found</h3>
              <p>Create your first project to get started</p>
              <Button onClick={() => navigate('/projects/create')}>Create New Project</Button>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
