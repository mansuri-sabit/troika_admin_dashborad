import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '../../services/projects';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import './CreateProject.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_email: '',
    monthly_token_limit: 100000,
    ai_provider: 'openai',
    openai_model: 'gpt-4o',
    openai_api_key: ''
  });
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      setError('Only PDF files are allowed');
      return;
    }
    setPdfFiles(prev => [...prev, ...pdfFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    setError('Project name is required');
    return;
  }
  
  if (!formData.client_email.trim()) {
    setError('Client email is required');
    return;
  }

  try {
    setLoading(true);
    setError('');

    // 🔥 Create FormData properly
    const submitData = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key].toString());
      }
    });
    
    // Add PDF files
    pdfFiles.forEach((file, index) => {
      submitData.append('pdf_files', file, file.name);
    });

    // 🔥 Call service with proper headers
    const response = await projectsService.createProjectWithFiles(submitData);
    
    // Navigate to project details page
    navigate(`/projects/${response.project.id}`);
  } catch (error) {
    console.error('Project creation error:', error);
    setError(error.response?.data?.error || 'Failed to create project');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="create-project">
      <div className="create-project-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
        <h1>Create New Project</h1>
        <p>Set up a new chatbot project for your client</p>
      </div>

      <form onSubmit={handleSubmit} className="create-project-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-section">
          <h3>Project Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="client_email">Client Email *</label>
              <input
                type="email"
                id="client_email"
                name="client_email"
                value={formData.client_email}
                onChange={handleInputChange}
                placeholder="client@example.com"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the project purpose and requirements"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>AI Configuration</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ai_provider">AI Provider</label>
              <select
                id="ai_provider"
                name="ai_provider"
                value={formData.ai_provider}
                onChange={handleInputChange}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="openai_model">Model</label>
              <select
                id="openai_model"
                name="openai_model"
                value={formData.openai_model}
                onChange={handleInputChange}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="monthly_token_limit">Monthly Token Limit</label>
              <input
                type="number"
                id="monthly_token_limit"
                name="monthly_token_limit"
                value={formData.monthly_token_limit}
                onChange={handleInputChange}
                min="1000"
                step="1000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="openai_api_key">Custom API Key (Optional)</label>
              <input
                type="password"
                id="openai_api_key"
                name="openai_api_key"
                value={formData.openai_api_key}
                onChange={handleInputChange}
                placeholder="Leave empty to use system default"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>PDF Documents</h3>
          <div className="file-upload-section">
            <div 
              className={`file-drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                <div className="upload-icon">📄</div>
                <p>Drag and drop PDF files here, or</p>
                <label htmlFor="pdf-files" className="file-select-btn">
                  Choose Files
                </label>
                <input
                  type="file"
                  id="pdf-files"
                  multiple
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <p className="file-hint">Only PDF files are supported</p>
              </div>
            </div>
            
            {pdfFiles.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({pdfFiles.length})</h4>
                <div className="file-list">
                  {pdfFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/projects')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            loading={loading}
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
