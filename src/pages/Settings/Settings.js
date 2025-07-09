import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    system: {
      site_name: 'Troika Tech Admin',
      site_url: '',
      admin_email: '',
      timezone: 'UTC',
      language: 'en'
    },
    ai: {
      default_provider: 'openai',
      openai_api_key: '',
      gemini_api_key: '',
      default_model: 'gpt-4o',
      max_tokens: 4000,
      temperature: 0.7
    },
    billing: {
      currency: 'USD',
      tax_rate: 0,
      invoice_prefix: 'INV-',
      payment_terms: 30
    },
    notifications: {
      email_notifications: true,
      slack_webhook: '',
      expiry_reminder_days: 7,
      usage_alert_threshold: 80
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data.settings || settings);
    } catch (error) {
      setError('Failed to fetch settings');
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put(`/admin/settings/${section}`, settings[section]);
      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
    } catch (error) {
      setError(`Failed to save ${section} settings`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'ai', label: 'AI Configuration', icon: '🤖' },
    { id: 'billing', label: 'Billing', icon: '💰' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  if (loading) {
    return (
      <div className="settings-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your system preferences and integrations</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-content">
          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Configuration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.system.site_name}
                    onChange={(e) => handleInputChange('system', 'site_name', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Site URL</label>
                  <input
                    type="url"
                    value={settings.system.site_url}
                    onChange={(e) => handleInputChange('system', 'site_url', e.target.value)}
                    placeholder="https://yourdomain.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={settings.system.admin_email}
                    onChange={(e) => handleInputChange('system', 'admin_email', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.system.timezone}
                    onChange={(e) => handleInputChange('system', 'timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
              </div>
              
              <div className="section-actions">
                <Button 
                  onClick={() => handleSave('system')} 
                  loading={saving}
                >
                  Save System Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="settings-section">
              <h2>AI Configuration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Default AI Provider</label>
                  <select
                    value={settings.ai.default_provider}
                    onChange={(e) => handleInputChange('ai', 'default_provider', e.target.value)}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Default Model</label>
                  <select
                    value={settings.ai.default_model}
                    onChange={(e) => handleInputChange('ai', 'default_model', e.target.value)}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>OpenAI API Key</label>
                  <input
                    type="password"
                    value={settings.ai.openai_api_key}
                    onChange={(e) => handleInputChange('ai', 'openai_api_key', e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Gemini API Key</label>
                  <input
                    type="password"
                    value={settings.ai.gemini_api_key}
                    onChange={(e) => handleInputChange('ai', 'gemini_api_key', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Max Tokens</label>
                  <input
                    type="number"
                    value={settings.ai.max_tokens}
                    onChange={(e) => handleInputChange('ai', 'max_tokens', parseInt(e.target.value))}
                    min="100"
                    max="8000"
                  />
                </div>
                
                <div className="form-group">
                  <label>Temperature</label>
                  <input
                    type="number"
                    value={settings.ai.temperature}
                    onChange={(e) => handleInputChange('ai', 'temperature', parseFloat(e.target.value))}
                    min="0"
                    max="2"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="section-actions">
                <Button 
                  onClick={() => handleSave('ai')} 
                  loading={saving}
                >
                  Save AI Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-section">
              <h2>Billing Configuration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={settings.billing.currency}
                    onChange={(e) => handleInputChange('billing', 'currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settings.billing.tax_rate}
                    onChange={(e) => handleInputChange('billing', 'tax_rate', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Invoice Prefix</label>
                  <input
                    type="text"
                    value={settings.billing.invoice_prefix}
                    onChange={(e) => handleInputChange('billing', 'invoice_prefix', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Payment Terms (Days)</label>
                  <input
                    type="number"
                    value={settings.billing.payment_terms}
                    onChange={(e) => handleInputChange('billing', 'payment_terms', parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              
              <div className="section-actions">
                <Button 
                  onClick={() => handleSave('billing')} 
                  loading={saving}
                >
                  Save Billing Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Configuration</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email_notifications}
                      onChange={(e) => handleInputChange('notifications', 'email_notifications', e.target.checked)}
                    />
                    Enable Email Notifications
                  </label>
                </div>
                
                <div className="form-group full-width">
                  <label>Slack Webhook URL</label>
                  <input
                    type="url"
                    value={settings.notifications.slack_webhook}
                    onChange={(e) => handleInputChange('notifications', 'slack_webhook', e.target.value)}
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Expiry Reminder (Days Before)</label>
                  <input
                    type="number"
                    value={settings.notifications.expiry_reminder_days}
                    onChange={(e) => handleInputChange('notifications', 'expiry_reminder_days', parseInt(e.target.value))}
                    min="1"
                    max="30"
                  />
                </div>
                
                <div className="form-group">
                  <label>Usage Alert Threshold (%)</label>
                  <input
                    type="number"
                    value={settings.notifications.usage_alert_threshold}
                    onChange={(e) => handleInputChange('notifications', 'usage_alert_threshold', parseInt(e.target.value))}
                    min="50"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="section-actions">
                <Button 
                  onClick={() => handleSave('notifications')} 
                  loading={saving}
                >
                  Save Notification Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
