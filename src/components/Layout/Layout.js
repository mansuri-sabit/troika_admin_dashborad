import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Header toggleSidebar={toggleSidebar} />
      <div className="layout-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
