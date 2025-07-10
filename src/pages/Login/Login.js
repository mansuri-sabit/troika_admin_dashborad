import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Login.css';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      console.log('🔐 User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    checkBackendConnection();
  }, [navigate]);

  // Health check using your API service
  const checkBackendConnection = async () => {
    setConnectionStatus('checking');
    try {
      console.log('🔍 Testing backend connection...');
      
      const response = await api.get('/health');
      
      if (response.status === 200) {
        setConnectionStatus('connected');
        console.log('✅ Backend connection successful:', response.data);
      } else {
        setConnectionStatus('error');
        console.error('❌ Backend health check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Backend connection check failed:', error);
      setConnectionStatus('error');
      
      // Set a user-friendly error message based on the error type
      if (error.code === 'ECONNABORTED') {
        console.log('⏱️ Connection timeout');
      } else if (error.message?.includes('Network Error')) {
        console.log('🌐 Network error detected');
      } else if (error.response?.status) {
        console.log(`📡 HTTP Error: ${error.response.status}`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login...');
      console.log('📧 Email:', formData.email);
      
      // Use your authService for login
      const response = await authService.login(formData.email, formData.password);
      
      console.log('✅ Login response received:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userRole: response.user?.role
      });
      
      // Validate response structure
      if (!response || !response.token) {
        throw new Error('Invalid response from server - missing authentication token');
      }
      
      // Store authentication data (authService handles this, but let's be explicit)
      localStorage.setItem('token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('👤 User data stored:', response.user.email, response.user.role);
      }
      
      console.log('🎉 Authentication successful, redirecting to dashboard...');
      
      // Small delay to show success state
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login service not found. Please contact support.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again in a few minutes.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes('Request failed')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    checkBackendConnection();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fillDefaultCredentials = () => {
    setFormData({
      email: 'admin@troikachatbot.com',
      password: 'Admin@123456'
    });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <h1>Troika Tech Admin</h1>
            <p>Sign in to your account</p>
          </div>
          
          {/* Connection Status Indicator */}
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'checking' && (
              <div className="status-item">
                <span className="status-icon">🔄</span>
                <span>Checking connection...</span>
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="status-item success">
                <span className="status-icon">🟢</span>
                <span>Connected to backend</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="status-item error">
                <span className="status-icon">🔴</span>
                <span>Connection error</span>
                <button 
                  type="button" 
                  className="retry-btn"
                  onClick={handleRetryConnection}
                  disabled={loading}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              disabled={loading || connectionStatus === 'error'}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={loading || connectionStatus === 'error'}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading || connectionStatus === 'error'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading || connectionStatus === 'error'}
          >
            {loading ? (
              <div className="loading-content">
                <LoadingSpinner size="small" />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <div className="default-credentials">
            <p>Need test credentials?</p>
            <button 
              type="button" 
              className="fill-credentials-btn"
              onClick={fillDefaultCredentials}
              disabled={loading}
            >
              Use Default Credentials
            </button>
          </div>
          
          <div className="environment-info">
            <small>
              Backend: https://completetroikabackend.onrender.com/api
            </small>
            <small>
              Status: <span className={`status-text ${connectionStatus}`}>
                {connectionStatus === 'connected' ? 'Online' : 
                 connectionStatus === 'checking' ? 'Checking...' : 'Offline'}
              </span>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
