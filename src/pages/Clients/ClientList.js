import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsService } from '../../services/clients';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import './ClientList.css';

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientsService.getClients();
      setClients(response.clients || []);
    } catch (error) {
      console.error('Clients fetch error:', error);
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newClient.name.trim()) {
      setError('Client name is required');
      return;
    }
    
    if (!newClient.email.trim()) {
      setError('Client email is required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      
      console.log('Creating client with data:', newClient);
      const response = await clientsService.createClient(newClient);
      console.log('Create client response:', response);
      
      setShowCreateModal(false);
      setNewClient({ name: '', email: '', company: '', phone: '', address: '' });
      fetchClients();
    } catch (error) {
      console.error('Create client error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      setActionLoading(true);
      setError('');
      
      await clientsService.deleteClient(selectedClient.id);
      setShowDeleteModal(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.error('Delete client error:', error);
      setError('Failed to delete client');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const getFilteredClients = () => {
    let filtered = clients;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(client =>
        (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="clients-loading">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredClients = getFilteredClients();

  return (
    <div className="clients-list">
      <div className="clients-header">
        <div className="header-left">
          <h1>Clients</h1>
          <p>Manage your client relationships</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Add New Client
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="clients-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="clients-grid">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="client-card">
              <div className="client-header">
                <div className="client-avatar">
                  {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="client-info">
                  <h3>{client.name || 'Unnamed Client'}</h3>
                  <p>{client.email || 'No email'}</p>
                  <span className="client-company">{client.company || 'No company'}</span>
                </div>
                <span className={`status-badge ${client.status || 'active'}`}>
                  {client.status || 'active'}
                </span>
              </div>
              
              <div className="client-stats">
                <div className="stat">
                  <span className="stat-number">{client.total_projects || 0}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{client.active_projects || 0}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat">
                  <span className="stat-number">${(client.total_cost || 0).toFixed(2)}</span>
                  <span className="stat-label">Total Cost</span>
                </div>
              </div>
              
              <div className="client-actions">
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={() => navigate(`/projects/create?client=${client.id}`)}
                >
                  New Project
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => openDeleteModal(client)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-clients">
            <div className="no-clients-content">
              <div className="no-clients-icon">👥</div>
              <h3>No clients found</h3>
              <p>Create your first client to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Add New Client
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Client Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Add New Client"
      >
        <form onSubmit={handleCreateClient} className="create-client-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Client Name *</label>
              <input
                type="text"
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                value={newClient.company}
                onChange={(e) => setNewClient({...newClient, company: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                rows="3"
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={actionLoading}
              disabled={actionLoading}
            >
              Create Client
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
          <p>Are you sure you want to delete <strong>{selectedClient?.name}</strong>?</p>
          <p className="warning-text">This action cannot be undone and will also delete all associated projects.</p>
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
              onClick={handleDeleteClient} 
              loading={actionLoading}
              disabled={actionLoading}
            >
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientList;
