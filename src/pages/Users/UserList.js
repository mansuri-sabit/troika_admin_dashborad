import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import Button from '../../components/Common/Button';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    company: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post('/admin/users', newUser);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        company: '',
        phone: ''
      });
      fetchUsers();
    } catch (error) {
      setError('Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      setActionLoading(true);
      await api.post(`/admin/users/${userId}/${action}`);
      fetchUsers();
    } catch (error) {
      setError(`Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setActionLoading(true);
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="users-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="users-list">
      <div className="users-header">
        <div className="header-left">
          <h1>Users</h1>
          <p>Manage system users and permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Create New User
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {users.filter(u => u.role === 'admin').length}
          </span>
          <span className="stat-label">Admins</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {users.filter(u => u.is_active).length}
          </span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {users.filter(u => !u.is_active).length}
          </span>
          <span className="stat-label">Inactive Users</span>
        </div>
      </div>

      <div className="users-table">
        {filteredUsers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                        {user.company && (
                          <span className="user-company">{user.company}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {user.last_login_at ? 
                      new Date(user.last_login_at).toLocaleDateString() : 
                      'Never'
                    }
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => setSelectedUser(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      {user.is_active ? (
                        <button
                          className="action-btn suspend"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          title="Suspend User"
                          disabled={actionLoading}
                        >
                          ⏸️
                        </button>
                      ) : (
                        <button
                          className="action-btn activate"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          title="Activate User"
                          disabled={actionLoading}
                        >
                          ▶️
                        </button>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                        disabled={actionLoading}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-users">
            <div className="no-users-content">
              <div className="no-users-icon">👥</div>
              <h3>No users found</h3>
              <p>Create your first user to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create New User
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="create-user-modal">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                minLength="8"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                value={newUser.company}
                onChange={(e) => setNewUser({...newUser, company: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={actionLoading}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;
