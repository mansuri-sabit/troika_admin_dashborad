import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsService } from '../../services/projects';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import Button from '../../components/Common/Button';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form states
  const [actionLoading, setActionLoading] = useState(false);
  const [renewDuration, setRenewDuration] = useState(12);
  const [uploadFiles, setUploadFiles] = useState([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    monthly_token_limit: 100000,
    ai_provider: 'openai',
    openai_model: 'gpt-4o',
    status: 'active'
  });

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('Invalid project ID');
      setLoading(false);
      return;
    }
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching project with ID:', id);
      const response = await projectsService.getProject(id);
      
      if (!response || !response.project) {
        setError('Project not found');
        return;
      }
      
      const projectData = response.project;
      setProject(projectData);
      
      // Initialize edit form with current project data
      setEditForm({
        name: projectData.name || '',
        description: projectData.description || '',
        monthly_token_limit: projectData.monthly_token_limit || 100000,
        ai_provider: projectData.ai_provider || 'openai',
        openai_model: projectData.openai_model || 'gpt-4o',
        status: projectData.status || 'active'
      });
      
    } catch (error) {
      console.error('Project details error:', error);
      setError(`Failed to fetch project details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const response = await projectsService.updateProject(project.id, editForm);
      
      if (response && response.project) {
        setProject(response.project);
        setShowEditModal(false);
        setSuccess('Project updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
      
    } catch (error) {
      console.error('Update project error:', error);
      setError(error.response?.data?.error || 'Failed to update project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project?.id) {
      setError('Invalid project ID');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      
      await projectsService.deleteProject(project.id);
      
      // Redirect to projects list after successful deletion
      navigate('/projects', { 
        state: { message: `Project "${project.name}" deleted successfully` }
      });
      
    } catch (error) {
      console.error('Delete project error:', error);
      setError(error.response?.data?.error || 'Failed to delete project');
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!project?.id) {
      setError('Invalid project ID');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await projectsService.updateProjectStatus(project.id, newStatus);
      setProject({ ...project, status: newStatus });
      setSuccess(`Project status changed to ${newStatus}`);
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update project status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewProject = async () => {
    if (!project?.id) {
      setError('Invalid project ID');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await projectsService.renewProject(project.id, renewDuration);
      setShowRenewModal(false);
      setSuccess(`Project renewed for ${renewDuration} months`);
      
      // Refresh project data
      fetchProjectDetails();
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Renew project error:', error);
      setError('Failed to renew project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (uploadFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('pdf_files', file);
      });
      
      await projectsService.uploadFiles(project.id, formData);
      
      setShowUploadModal(false);
      setUploadFiles([]);
      setSuccess('Files uploaded successfully');
      
      // Refresh project data to show new files
      fetchProjectDetails();
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('File upload error:', error);
      setError('Failed to upload files');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setError('Only PDF files are allowed');
      return;
    }
    
    setUploadFiles(pdfFiles);
    setError('');
  };

  const removeUploadFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'suspended': return '#dc3545';
      case 'expired': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getUsagePercentage = () => {
    if (!project || !project.monthly_token_limit || project.monthly_token_limit === 0) return 0;
    return Math.min((project.total_tokens_used / project.monthly_token_limit) * 100, 100);
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="project-details-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state (no project found)
  if (error && !project) {
    return (
      <div className="project-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <Button onClick={() => navigate('/projects')} variant="outline">
            Back to Projects
          </Button>
          <Button onClick={fetchProjectDetails}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!project) {
    return (
      <div className="project-not-found">
        <h2>Project Not Found</h2>
        <p>The requested project could not be found.</p>
        <Button onClick={() => navigate('/projects')} variant="outline">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="project-details">
      {/* Header Section */}
      <div className="project-details-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/projects')}>
            ← Back to Projects
          </button>
          <div className="project-title">
            <h1>{project.name || 'Unnamed Project'}</h1>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(project.status) }}
            >
              {project.status || 'unknown'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="outline" 
            onClick={() => setShowEditModal(true)}
            disabled={actionLoading}
          >
            ✏️ Edit Project
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowUploadModal(true)}
            disabled={actionLoading}
          >
            📄 Upload Files
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowRenewModal(true)}
            disabled={actionLoading}
          >
            🔄 Renew
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading}
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Main Content */}
      <div className="project-details-content">
        <div className="details-grid">
          {/* Project Information Card */}
          <div className="details-card">
            <h3>📋 Project Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Project ID</label>
                <span>{project.project_id || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Description</label>
                <span>{project.description || 'No description'}</span>
              </div>
              <div className="info-item">
                <label>Client Email</label>
                <span>{project.client_email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Created Date</label>
                <span>{formatDate(project.created_at)}</span>
              </div>
              <div className="info-item">
                <label>Expiry Date</label>
                <span>{formatDate(project.expiry_date)}</span>
              </div>
              <div className="info-item">
                <label>AI Provider</label>
                <span>{project.ai_provider || 'OpenAI'}</span>
              </div>
              <div className="info-item">
                <label>Model</label>
                <span>{project.openai_model || 'gpt-4o'}</span>
              </div>
              <div className="info-item">
                <label>Monthly Token Limit</label>
                <span>{(project.monthly_token_limit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Usage Statistics Card */}
          <div className="details-card">
            <h3>📊 Usage Statistics</h3>
            <div className="usage-stats">
              <div className="usage-item">
                <div className="usage-header">
                  <span>Token Usage</span>
                  <span>{(project.total_tokens_used || 0).toLocaleString()} / {(project.monthly_token_limit || 0).toLocaleString()}</span>
                </div>
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ width: `${getUsagePercentage()}%` }}
                  ></div>
                </div>
                <span className="usage-percentage">{getUsagePercentage().toFixed(1)}%</span>
              </div>
              
              <div className="cost-info">
                <div className="cost-item">
                  <label>Today's Cost</label>
                  <span>${(project.estimated_cost_today || 0).toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <label>Monthly Cost</label>
                  <span>${(project.estimated_cost_month || 0).toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <label>Total Cost</label>
                  <span>${(project.total_cost || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Documents Card */}
          <div className="details-card">
            <h3>📄 PDF Documents</h3>
            <div className="pdf-files">
              {project.pdf_files && project.pdf_files.length > 0 ? (
                project.pdf_files.map((file, index) => (
                  <div key={index} className="pdf-file-item">
                    <div className="file-info">
                      <span className="file-name">{file.file_name || `File ${index + 1}`}</span>
                      <span className="file-size">
                        {file.file_size ? (file.file_size / 1024).toFixed(1) + ' KB' : 'Unknown size'}
                      </span>
                    </div>
                    <span className={`file-status ${file.status || 'unknown'}`}>
                      {file.status || 'unknown'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-files">
                  <p>No PDF files uploaded</p>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Files
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Embed Code Card */}
          <div className="details-card">
            <h3>🔗 Embed Code</h3>
            <div className="embed-section">
              <textarea 
                className="embed-code"
                value={project.embed_code || '<!-- No embed code available -->'}
                readOnly
                rows="6"
              />
              <div className="embed-actions">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(project.embed_code || '')}
                  disabled={!project.embed_code}
                >
                  📋 Copy Code
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/embed/${project.project_id}`, '_blank')}
                  disabled={!project.project_id}
                >
                  👁️ Preview Widget
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Management Section */}
        <div className="status-actions">
          <h3>⚙️ Status Management</h3>
          <div className="action-buttons">
            <Button 
              variant={project.status === 'active' ? 'success' : 'outline'}
              onClick={() => handleStatusChange('active')}
              disabled={actionLoading || project.status === 'active'}
            >
              ✅ Activate
            </Button>
            <Button 
              variant={project.status === 'suspended' ? 'warning' : 'outline'}
              onClick={() => handleStatusChange('suspended')}
              disabled={actionLoading || project.status === 'suspended'}
            >
              ⏸️ Suspend
            </Button>
            <Button 
              variant={project.status === 'expired' ? 'secondary' : 'outline'}
              onClick={() => handleStatusChange('expired')}
              disabled={actionLoading || project.status === 'expired'}
            >
              ⏰ Mark Expired
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        size="large"
      >
        <form onSubmit={handleUpdateProject} className="edit-project-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="monthly_token_limit">Monthly Token Limit</label>
              <input
                type="number"
                id="monthly_token_limit"
                value={editForm.monthly_token_limit}
                onChange={(e) => setEditForm({...editForm, monthly_token_limit: parseInt(e.target.value)})}
                min="1000"
                step="1000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ai_provider">AI Provider</label>
              <select
                id="ai_provider"
                value={editForm.ai_provider}
                onChange={(e) => setEditForm({...editForm, ai_provider: e.target.value})}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="openai_model">Model</label>
              <select
                id="openai_model"
                value={editForm.openai_model}
                onChange={(e) => setEditForm({...editForm, openai_model: e.target.value})}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows="3"
                placeholder="Project description..."
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={actionLoading}
              disabled={actionLoading}
            >
              Update Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* File Upload Modal */}
      <Modal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        title="Upload PDF Files"
      >
        <form onSubmit={handleFileUpload} className="upload-form">
          <div className="upload-section">
            <div className="file-input-section">
              <label htmlFor="pdf-files" className="file-input-label">
                📄 Select PDF Files
              </label>
              <input
                type="file"
                id="pdf-files"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <p className="file-hint">Only PDF files are supported</p>
            </div>
            
            {uploadFiles.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({uploadFiles.length})</h4>
                <div className="file-list">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeUploadFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowUploadModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={actionLoading}
              disabled={actionLoading || uploadFiles.length === 0}
            >
              Upload Files
            </Button>
          </div>
        </form>
      </Modal>

      {/* Renew Project Modal */}
      <Modal 
        isOpen={showRenewModal} 
        onClose={() => setShowRenewModal(false)}
        title="Renew Subscription"
      >
        <div className="renew-modal">
          <p>Select renewal duration for <strong>{project.name}</strong>:</p>
          <div className="duration-options">
            {[1, 3, 6, 12].map(months => (
              <label key={months}>
                <input 
                  type="radio" 
                  name="duration" 
                  value={months} 
                  checked={renewDuration === months}
                  onChange={(e) => setRenewDuration(parseInt(e.target.value))}
                />
                {months} Month{months > 1 ? 's' : ''}
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <Button 
              variant="outline" 
              onClick={() => setShowRenewModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenewProject} 
              loading={actionLoading}
              disabled={actionLoading}
            >
              Renew Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Project Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
      >
        <div className="delete-modal">
          <div className="delete-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h4>Are you sure you want to delete this project?</h4>
              <p><strong>Project:</strong> {project.name}</p>
              <p><strong>Project ID:</strong> {project.project_id}</p>
              <p className="warning-text">
                This action cannot be undone. All project data, including uploaded files, 
                chat history, and analytics will be permanently deleted.
              </p>
            </div>
          </div>
          
          <div className="modal-actions">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteProject} 
              loading={actionLoading}
              disabled={actionLoading}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
