import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { projectsService } from '../../services/projects';
import './EmbedGenerator.css';

const EmbedGenerator = ({ projectId, projectConfig }) => {
  const [embedConfig, setEmbedConfig] = useState({
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#667eea',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Type your message...',
    height: '500px',
    width: '350px',
    showBranding: true,
    enableSound: true,
    autoOpen: false,
    triggerDelay: 3000
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedData, setEmbedData] = useState(null);
  const [previewMode, setPreviewMode] = useState('code');

  // Backend URL - using the fixed domain from your updated main.go
  const BACKEND_URL = 'https://completetroikabackend.onrender.com';

  useEffect(() => {
    fetchEmbedData();
  }, [projectId]);

  const fetchEmbedData = async () => {
    try {
      setLoading(true);
      const response = await projectsService.getEmbedCode(projectId);
      setEmbedData(response);
      console.log('✅ Embed data fetched:', response);
    } catch (error) {
      console.error('❌ Failed to fetch embed data:', error);
      toast.error('Failed to load embed configuration');
    } finally {
      setLoading(false);
    }
  };

  const generateEmbedCode = () => {
    return `<!-- Troika Tech Chatbot Widget -->
<div id="troika-chatbot-${projectId}"></div>
<script>
  (function() {
    var config = {
      projectId: '${projectId}',
      theme: '${embedConfig.theme}',
      position: '${embedConfig.position}',
      primaryColor: '${embedConfig.primaryColor}',
      welcomeMessage: '${embedConfig.welcomeMessage}',
      placeholder: '${embedConfig.placeholder}',
      height: '${embedConfig.height}',
      width: '${embedConfig.width}',
      showBranding: ${embedConfig.showBranding},
      enableSound: ${embedConfig.enableSound},
      autoOpen: ${embedConfig.autoOpen},
      triggerDelay: ${embedConfig.triggerDelay},
      apiUrl: '${BACKEND_URL}/api'
    };
    
    var script = document.createElement('script');
    script.src = '${BACKEND_URL}/widget.js';
    script.setAttribute('data-project-id', '${projectId}');
    script.onload = function() {
      if (typeof TroikaChatbot !== 'undefined') {
        TroikaChatbot.init(config);
      } else {
        console.error('TroikaChatbot not loaded');
      }
    };
    script.onerror = function() {
      console.error('Failed to load Troika Chatbot widget');
    };
    script.async = true;
    document.head.appendChild(script);
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${BACKEND_URL}/static/widget.css';
    link.onerror = function() {
      console.warn('Failed to load widget CSS, using default styles');
    };
    document.head.appendChild(link);
  })();
</script>

<!-- Optional: Custom CSS for additional styling -->
<style>
  #troika-chatbot-${projectId} {
    --primary-color: ${embedConfig.primaryColor};
    --widget-height: ${embedConfig.height};
    --widget-width: ${embedConfig.width};
  }
</style>`;
  };

  const generateIframeCode = () => {
    const iframeUrl = `${BACKEND_URL}/embed/${projectId}?theme=${embedConfig.theme}&color=${encodeURIComponent(embedConfig.primaryColor)}&welcome=${encodeURIComponent(embedConfig.welcomeMessage)}`;
    
    return `<!-- Troika Tech Chatbot iFrame -->
<iframe 
  src="${iframeUrl}"
  width="${embedConfig.width}"
  height="${embedConfig.height}"
  frameborder="0"
  allow="microphone; camera"
  style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
  title="Troika Chatbot">
</iframe>`;
  };

  const generateWordPressCode = () => {
    return `<!-- Add this to your WordPress theme's functions.php -->
<?php
function add_troika_chatbot() {
    ?>
    <div id="troika-chatbot-${projectId}"></div>
    <script>
      ${generateEmbedCode().replace(/<script>|<\/script>/g, '').replace(/<!-- .* -->/g, '')}
    </script>
    <?php
}
add_action('wp_footer', 'add_troika_chatbot');
?>`;
  };

  const copyToClipboard = async () => {
    try {
      let codeToCopy = '';
      switch (previewMode) {
        case 'iframe':
          codeToCopy = generateIframeCode();
          break;
        case 'wordpress':
          codeToCopy = generateWordPressCode();
          break;
        default:
          codeToCopy = generateEmbedCode();
      }
      
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      toast.success('Embed code copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy code');
    }
  };

  const handleConfigChange = (key, value) => {
    setEmbedConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setEmbedConfig({
      theme: 'light',
      position: 'bottom-right',
      primaryColor: '#667eea',
      welcomeMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your message...',
      height: '500px',
      width: '350px',
      showBranding: true,
      enableSound: true,
      autoOpen: false,
      triggerDelay: 3000
    });
    toast.info('Configuration reset to defaults');
  };

  const testWidget = () => {
    const testUrl = `${BACKEND_URL}/embed/${projectId}?test=true&theme=${embedConfig.theme}&color=${encodeURIComponent(embedConfig.primaryColor)}`;
    window.open(testUrl, '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
  };

  if (loading) {
    return (
      <div className="embed-generator loading">
        <LoadingSpinner />
        <p>Loading embed configuration...</p>
      </div>
    );
  }

  return (
    <div className="embed-generator">
      <div className="embed-header">
        <h3>🔗 Chatbot Embed Code Generator</h3>
        <p>Customize and generate embed code for your chatbot widget</p>
        
        {embedData && (
          <div className="embed-info">
            <div className="info-item">
              <span className="label">Project ID:</span>
              <code>{projectId}</code>
            </div>
            <div className="info-item">
              <span className="label">Widget URL:</span>
              <code>{embedData.widget_url}</code>
            </div>
            <div className="info-item">
              <span className="label">Domain:</span>
              <code>{embedData.domain}</code>
            </div>
          </div>
        )}
      </div>
      
      <div className="config-section">
        <div className="section-header">
          <h4>🎨 Customization Options</h4>
          <Button variant="outline" size="small" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>
        
        <div className="config-grid">
          <div className="config-item">
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme"
              value={embedConfig.theme}
              onChange={(e) => handleConfigChange('theme', e.target.value)}
            >
              <option value="light">🌞 Light</option>
              <option value="dark">🌙 Dark</option>
              <option value="auto">🔄 Auto (System)</option>
            </select>
          </div>
          
          <div className="config-item">
            <label htmlFor="position">Position</label>
            <select 
              id="position"
              value={embedConfig.position}
              onChange={(e) => handleConfigChange('position', e.target.value)}
            >
              <option value="bottom-right">↘️ Bottom Right</option>
              <option value="bottom-left">↙️ Bottom Left</option>
              <option value="top-right">↗️ Top Right</option>
              <option value="top-left">↖️ Top Left</option>
              <option value="center">🎯 Center</option>
            </select>
          </div>
          
          <div className="config-item">
            <label htmlFor="primaryColor">Primary Color</label>
            <div className="color-input-group">
              <input 
                type="color"
                id="primaryColor"
                value={embedConfig.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
              />
              <input 
                type="text"
                value={embedConfig.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                placeholder="#667eea"
              />
            </div>
          </div>
          
          <div className="config-item">
            <label htmlFor="welcomeMessage">Welcome Message</label>
            <input 
              type="text"
              id="welcomeMessage"
              value={embedConfig.welcomeMessage}
              onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
              placeholder="Hello! How can I help you today?"
            />
          </div>
          
          <div className="config-item">
            <label htmlFor="placeholder">Input Placeholder</label>
            <input 
              type="text"
              id="placeholder"
              value={embedConfig.placeholder}
              onChange={(e) => handleConfigChange('placeholder', e.target.value)}
              placeholder="Type your message..."
            />
          </div>
          
          <div className="config-item">
            <label htmlFor="height">Height</label>
            <input 
              type="text"
              id="height"
              value={embedConfig.height}
              onChange={(e) => handleConfigChange('height', e.target.value)}
              placeholder="500px"
            />
          </div>
          
          <div className="config-item">
            <label htmlFor="width">Width</label>
            <input 
              type="text"
              id="width"
              value={embedConfig.width}
              onChange={(e) => handleConfigChange('width', e.target.value)}
              placeholder="350px"
            />
          </div>
          
          <div className="config-item">
            <label htmlFor="triggerDelay">Auto-open Delay (ms)</label>
            <input 
              type="number"
              id="triggerDelay"
              value={embedConfig.triggerDelay}
              onChange={(e) => handleConfigChange('triggerDelay', parseInt(e.target.value))}
              min="0"
              step="1000"
            />
          </div>
        </div>
        
        <div className="config-toggles">
          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={embedConfig.showBranding}
                onChange={(e) => handleConfigChange('showBranding', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              Show Troika Branding
            </label>
          </div>
          
          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={embedConfig.enableSound}
                onChange={(e) => handleConfigChange('enableSound', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              Enable Sound Notifications
            </label>
          </div>
          
          <div className="toggle-item">
            <label className="toggle-label">
              <input 
                type="checkbox"
                checked={embedConfig.autoOpen}
                onChange={(e) => handleConfigChange('autoOpen', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              Auto-open Widget
            </label>
          </div>
        </div>
      </div>
      
      <div className="embed-code-section">
        <div className="section-header">
          <h4>📋 Generated Code</h4>
          <div className="code-type-tabs">
            <button 
              className={`tab ${previewMode === 'code' ? 'active' : ''}`}
              onClick={() => setPreviewMode('code')}
            >
              JavaScript
            </button>
            <button 
              className={`tab ${previewMode === 'iframe' ? 'active' : ''}`}
              onClick={() => setPreviewMode('iframe')}
            >
              iFrame
            </button>
            <button 
              className={`tab ${previewMode === 'wordpress' ? 'active' : ''}`}
              onClick={() => setPreviewMode('wordpress')}
            >
              WordPress
            </button>
          </div>
        </div>
        
        <div className="code-container">
          <textarea 
            className="embed-code"
            value={
              previewMode === 'iframe' ? generateIframeCode() :
              previewMode === 'wordpress' ? generateWordPressCode() :
              generateEmbedCode()
            }
            readOnly
            rows="20"
          />
          
          <div className="code-overlay">
            <div className="code-info">
              <span className="code-type">
                {previewMode === 'iframe' ? 'iFrame Embed' :
                 previewMode === 'wordpress' ? 'WordPress Code' :
                 'JavaScript Widget'}
              </span>
              <span className="code-size">
                {previewMode === 'iframe' ? generateIframeCode().length :
                 previewMode === 'wordpress' ? generateWordPressCode().length :
                 generateEmbedCode().length} characters
              </span>
            </div>
          </div>
        </div>
        
        <div className="embed-actions">
          <Button 
            onClick={copyToClipboard}
            disabled={copied}
            className={copied ? 'copied' : ''}
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testWidget}
          >
            🔍 Test Widget
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.open(`${BACKEND_URL}/embed/${projectId}`, '_blank')}
          >
            👁️ Live Preview
          </Button>
          
          <Button 
            variant="outline" 
            onClick={fetchEmbedData}
            disabled={loading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>
      
      <div className="embed-instructions">
        <h4>📖 Integration Instructions</h4>
        <div className="instruction-tabs">
          {previewMode === 'code' && (
            <div className="instruction-content">
              <h5>JavaScript Widget Integration:</h5>
              <ol>
                <li>Copy the generated JavaScript code above</li>
                <li>Paste it into your website's HTML, preferably before the closing <code>&lt;/body&gt;</code> tag</li>
                <li>The widget will automatically load and initialize</li>
                <li>Customize the appearance using the configuration options</li>
              </ol>
            </div>
          )}
          
          {previewMode === 'iframe' && (
            <div className="instruction-content">
              <h5>iFrame Integration:</h5>
              <ol>
                <li>Copy the generated iFrame code above</li>
                <li>Paste it anywhere in your HTML where you want the chatbot to appear</li>
                <li>Adjust width and height as needed</li>
                <li>The chatbot will be contained within the iframe</li>
              </ol>
            </div>
          )}
          
          {previewMode === 'wordpress' && (
            <div className="instruction-content">
              <h5>WordPress Integration:</h5>
              <ol>
                <li>Copy the generated PHP code above</li>
                <li>Add it to your theme's <code>functions.php</code> file</li>
                <li>Or use a plugin like "Insert Headers and Footers"</li>
                <li>The widget will appear on all pages</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbedGenerator;
