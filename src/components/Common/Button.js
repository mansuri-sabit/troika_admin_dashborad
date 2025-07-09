import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className} ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="small" />}
      <span className={loading ? 'btn-text-loading' : ''}>{children}</span>
    </button>
  );
};

export default Button;
