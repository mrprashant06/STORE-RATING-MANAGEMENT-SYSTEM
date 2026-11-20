import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'OWNER':
        return 'badge-owner';
      case 'USER':
      default:
        return 'badge-user';
    }
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <Link to={getDashboardPath()} className="navbar-brand">
          <span className="brand-icon">⭐</span>
          <span className="brand-text">StoreRating<span className="brand-accent">Hub</span></span>
        </Link>
      </div>

      <div className="navbar-right">
        <ThemeToggle />
        {user && (
          <div className="user-profile-menu">
            <div className="user-details-summary">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>{user.role}</span>
            </div>

            <div className="navbar-actions">
              <Link to="/change-password" className="btn btn-outline btn-sm">
                Change Password
              </Link>
              <button onClick={handleLogout} className="btn btn-danger-outline btn-sm">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
