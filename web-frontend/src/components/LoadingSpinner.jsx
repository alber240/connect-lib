import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizes = {
    small: '30px',
    medium: '50px',
    large: '70px',
  };

  return (
    <div className="spinner-container">
      <div 
        className="spinner" 
        style={{ 
          width: sizes[size], 
          height: sizes[size],
          borderWidth: size === 'large' ? '6px' : '4px'
        }}
      />
    </div>
  );
};

export default LoadingSpinner;