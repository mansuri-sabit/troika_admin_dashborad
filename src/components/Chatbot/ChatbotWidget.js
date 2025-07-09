import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../../services/chatbot';
import LoadingSpinner from '../Common/LoadingSpinner';
import './ChatbotWidget.css';

const ChatbotWidget = ({ projectId, isEmbedded = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChatSession();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatSession = async () => {
    try {
      const response = await chatbotService.createSession(projectId);
      setSessionId(response.sessionId);
      
      // Add welcome message
      setMessages([{
        id: Date.now(),
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      setError('Failed to start chat session');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setError('');

    try {
      const response = await chatbotService.sendMessage({
        sessionId,
        projectId,
        message: userMessage.text
      });

      // Simulate typing delay
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(),
          sources: response.sources || []
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isEmbedded) {
    return (
      <div className="chatbot-embedded">
        <div className="chat-header">
          <h3>AI Assistant</h3>
          <span className="status-indicator online"></span>
        </div>
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <p>{message.text}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <small>Sources:</small>
                    {message.sources.map((source, index) => (
                      <span key={index} className="source-tag">{source}</span>
                    ))}
                  </div>
                )}
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? <LoadingSpinner size="small" /> : '📤'}
            </button>
          </div>
        </form>
        {error && <div className="chat-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="chatbot-widget">
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
      
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <div className="header-actions">
              <span className="status-indicator online"></span>
              <button className="minimize-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <p>{message.text}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <small>Sources:</small>
                      {message.sources.map((source, index) => (
                        <span key={index} className="source-tag">{source}</span>
                      ))}
                    </div>
                  )}
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-avatar">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !inputMessage.trim()}>
                {isLoading ? <LoadingSpinner size="small" /> : '📤'}
              </button>
            </div>
          </form>
          
          {error && <div className="chat-error">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
