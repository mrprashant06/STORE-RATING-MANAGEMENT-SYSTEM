import React from 'react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <div className="spinner-container">
      <div className="spinner"></div>
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="spinner-fullscreen">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;
