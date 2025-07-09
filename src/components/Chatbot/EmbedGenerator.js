import React, { useState } from 'react';
import Button from '../Common/Button';
import './EmbedGenerator.css';

const EmbedGenerator = ({ projectId, projectConfig }) => {
  const [embedConfig, setEmbedConfig] = useState({
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#667eea',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Type your message...',
    height: '500px',
    width: '350px'
  });

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
      width: '${embedConfig.width}'
    };
    
    var script = document.createElement('script');
    script.src = '${process.env.REACT_APP_API_BASE_URL}/widget/chatbot.js';
    script.onload = function() {
      TroikaChatbot.init(config);
    };
    document.head.appendChild(script);
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${process.env.REACT_APP_API_BASE_URL}/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
  };

  return (
    <div className="embed-generator">
      <h3>Chatbot Embed Code Generator</h3>
      
      <div className="config-section">
        <h4>Customization Options</h4>
        
        <div className="config-grid">
          <div className="config-item">
            <label>Theme</label>
            <select 
              value={embedConfig.theme}
              onChange={(e) => setEmbedConfig({...embedConfig, theme: e.target.value})}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="config-item">
            <label>Position</label>
            <select 
              value={embedConfig.position}
              onChange={(e) => setEmbedConfig({...embedConfig, position: e.target.value})}
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
          
          <div className="config-item">
            <label>Primary Color</label>
            <input 
              type="color"
              value={embedConfig.primaryColor}
              onChange={(e) => setEmbedConfig({...embedConfig, primaryColor: e.target.value})}
            />
          </div>
          
          <div className="config-item">
            <label>Welcome Message</label>
            <input 
              type="text"
              value={embedConfig.welcomeMessage}
              onChange={(e) => setEmbedConfig({...embedConfig, welcomeMessage: e.target.value})}
            />
          </div>
        </div>
      </div>
      
      <div className="embed-code-section">
        <h4>Embed Code</h4>
        <textarea 
          className="embed-code"
          value={generateEmbedCode()}
          readOnly
          rows="15"
        />
        <div className="embed-actions">
          <Button onClick={copyToClipboard}>Copy Code</Button>
          <Button variant="outline" onClick={() => window.open(`/preview/${projectId}`, '_blank')}>
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmbedGenerator;
