import React from 'react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner-container">
          <div className="spinner"></div>
          {message && <p className="spinner-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-inline">
      <div className="spinner spinner-sm"></div>
      {message && <span className="spinner-message-sm">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
