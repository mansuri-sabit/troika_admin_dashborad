import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/clients', label: 'Clients', icon: '👤' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
