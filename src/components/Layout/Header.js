import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
 const user = authService.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Force navigation to login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };


  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        <h1 className="header-title">Troika Tech Admin</h1>
      </div>
      
      <div className="header-right">
        <div className="user-menu">
          <button 
            className="user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-item">
                <span>Profile</span>
              </div>
              <div className="dropdown-item">
                <span>Settings</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={handleLogout}>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
