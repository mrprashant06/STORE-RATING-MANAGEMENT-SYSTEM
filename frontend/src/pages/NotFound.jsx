import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="status-page-container">
      <div className="status-card">
        <div className="status-icon">🔍</div>
        <h1>404 - Page Not Found</h1>
        <p className="status-message">The page you are looking for does not exist or has been moved.</p>
        <div className="status-actions">
          <button className="btn btn-primary" onClick={() => navigate(getDashboardPath())}>
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
