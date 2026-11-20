import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="status-page-container">
      <div className="status-card">
        <div className="status-icon">🚫</div>
        <h1>403 - Access Denied</h1>
        <p className="status-message">
          You do not have the required permissions to access this page. 
          {user && ` You are currently signed in as a ${user.role}.`}
        </p>
        <div className="status-actions">
          <button className="btn btn-primary" onClick={() => navigate(getDashboardPath())}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
