import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsService } from '../../services/clients';
import { projectsService } from '../../services/projects';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import './ClientDetails.css';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [clientProjects, setClientProjects] = useState([]);
  const [clientStats, setClientStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    status: 'active',
    notes: '',
    tags: []
  });

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const [clientResponse, projectsResponse, statsResponse] = await Promise.all([
        clientsService.getClient(id),
        clientsService.getClientProjects(id),
        clientsService.getClientStats(id)
      ]);
      
      setClient(clientResponse.client);
      setClientProjects(projectsResponse.projects || []);
      setClientStats(statsResponse.stats);
      
      // Populate edit form
      setEditForm({
        name: clientResponse.client.name,
        email: clientResponse.client.email,
        company: clientResponse.client.company || '',
        phone: clientResponse.client.phone || '',
        address: clientResponse.client.address || '',
        status: clientResponse.client.status,
        notes: clientResponse.client.notes || '',
        tags: clientResponse.client.tags || []
      });
    } catch (error) {
      setError('Failed to fetch client details');
      console.error('Client details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await clientsService.updateClient(id, editForm);
      setShowEditModal(false);
      fetchClientDetails();
    } catch (error) {
      setError('Failed to update client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      setActionLoading(true);
      await clientsService.deleteClient(id);
      navigate('/clients');
    } catch (error) {
      setError('Failed to delete client');
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'suspended': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="client-details-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="client-details-error">
        <p>{error}</p>
        <Button onClick={fetchClientDetails}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="client-details">
      <div className="client-details-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/clients')}>
            ← Back to Clients
          </button>
          <div className="client-title">
            <h1>{client.name}</h1>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(client.status) }}
            >
              {client.status}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="outline" 
            onClick={() => setShowEditModal(true)}
          >
            Edit Client
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate(`/projects/create?client=${client.id}`)}
          >
            New Project
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Client
          </Button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="client-details-content">
        <div className="details-grid">
          <div className="client-info-card">
            <h3>Client Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Client ID</label>
                <span>{client.client_id}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{client.email}</span>
              </div>
              <div className="info-item">
                <label>Company</label>
                <span>{client.company || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{client.phone || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Created Date</label>
                <span>{new Date(client.created_at).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Last Login</label>
                <span>
                  {client.last_login_at ? 
                    new Date(client.last_login_at).toLocaleDateString() : 
                    'Never'
                  }
                </span>
              </div>
            </div>
            
            {client.address && (
              <div className="address-section">
                <label>Address</label>
                <p>{client.address}</p>
              </div>
            )}
            
            {client.notes && (
              <div className="notes-section">
                <label>Notes</label>
                <p>{client.notes}</p>
              </div>
            )}
            
            {client.tags && client.tags.length > 0 && (
              <div className="tags-section">
                <label>Tags</label>
                <div className="tags-list">
                  {client.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="client-stats-card">
            <h3>Usage Statistics</h3>
            {clientStats ? (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{clientStats.total_projects}</span>
                  <span className="stat-label">Total Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{clientStats.active_projects}</span>
                  <span className="stat-label">Active Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{clientStats.total_tokens_used.toLocaleString()}</span>
                  <span className="stat-label">Tokens Used</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">${clientStats.total_cost.toFixed(2)}</span>
                  <span className="stat-label">Total Cost</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{clientStats.average_tokens_per_day.toLocaleString()}</span>
                  <span className="stat-label">Avg Daily Tokens</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {clientStats.last_activity_date ? 
                      new Date(clientStats.last_activity_date).toLocaleDateString() : 
                      'No activity'
                    }
                  </span>
                  <span className="stat-label">Last Activity</span>
                </div>
              </div>
            ) : (
              <p>No statistics available</p>
            )}
          </div>
        </div>

        <div className="client-projects-section">
          <div className="section-header">
            <h3>Client Projects ({clientProjects.length})</h3>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => navigate(`/projects/create?client=${client.id}`)}
            >
              Add Project
            </Button>
          </div>
          
          <div className="projects-table">
            {clientProjects.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Usage</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div className="project-info">
                          <span className="project-name">{project.name}</span>
                          <span className="project-id">{project.project_id}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(project.status) }}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <div className="usage-info">
                          <div className="usage-bar">
                            <div 
                              className="usage-fill"
                              style={{ 
                                width: `${Math.min((project.total_tokens_used / project.monthly_token_limit) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="usage-text">
                            {project.total_tokens_used.toLocaleString()} / {project.monthly_token_limit.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(project.created_at).toLocaleDateString()}</td>
                      <td>{new Date(project.expiry_date).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          variant="outline" 
                          size="small"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-projects">
                <p>No projects found for this client</p>
                <Button 
                  variant="primary"
                  onClick={() => navigate(`/projects/create?client=${client.id}`)}
                >
                  Create First Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Client"
        size="large"
      >
        <form onSubmit={handleUpdateClient} className="edit-client-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Client Name *</label>
              <input
                type="text"
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                value={editForm.company}
                onChange={(e) => setEditForm({...editForm, company: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                rows="3"
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows="3"
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={actionLoading}
            >
              Update Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Client Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
      >
        <div className="delete-modal">
          <p>Are you sure you want to delete <strong>{client.name}</strong>?</p>
          <p className="warning-text">This will also delete all associated projects and cannot be undone.</p>
          <div className="modal-actions">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteClient} 
              loading={actionLoading}
            >
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientDetails;
