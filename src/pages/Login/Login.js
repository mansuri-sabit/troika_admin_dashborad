import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
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
  const navigate = useNavigate();

  // Check backend connectivity on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      // ✅ Fixed: Add /api prefix to health check
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('✅ Backend connection successful');
      } else {
        setConnectionStatus('error');
        console.error('❌ Backend health check failed:', response.status);
      }
    } catch (error) {
      console.error('Backend connection check failed:', error);
      setConnectionStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Validate response structure
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Store authentication data
      localStorage.setItem('token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error handling for specific issues
      let errorMessage = 'Login failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - please check your connection and try again';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'Connection error - please contact support';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login service not found - please contact support';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts - please try again later';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setConnectionStatus('checking');
    checkBackendConnection();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Troika Tech Admin</h1>
          <p>Sign in to your account</p>
          
          {/* Connection Status Indicator */}
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'checking' && (
              <span>🔄 Checking connection...</span>
            )}
            {connectionStatus === 'connected' && (
              <span>🟢 Connected to backend</span>
            )}
            {connectionStatus === 'error' && (
              <span>
                🔴 Connection error 
                <button 
                  type="button" 
                  className="retry-btn"
                  onClick={handleRetryConnection}
                >
                  Retry
                </button>
              </span>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
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
              placeholder="Enter your email"
              disabled={loading || connectionStatus === 'error'}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={loading || connectionStatus === 'error'}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading || connectionStatus === 'error'}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Default credentials: admin@troikachatbot.com / Admin@123456</p>
          <div className="environment-info">
            <small>
              Backend: {process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api` : 'Not configured'}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
