import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDetails from './pages/Projects/ProjectDetails';
import CreateProject from './pages/Projects/CreateProject';
import UserList from './pages/Users/UserList';
import ClientList from './pages/Clients/ClientList';
import ClientDetails from './pages/Clients/ClientDetails';
import Analytics from './pages/Analytics/Analytics';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Layout>
                <ProjectList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects/create" element={
            <ProtectedRoute>
              <Layout>
                <CreateProject />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetails />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UserList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <Layout>
                <ClientList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute>
              <Layout>
                <ClientDetails />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
