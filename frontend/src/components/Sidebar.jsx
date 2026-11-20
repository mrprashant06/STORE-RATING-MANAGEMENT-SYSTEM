import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section-title">NAVIGATION</div>
      <nav className="sidebar-nav">
        {user.role === 'ADMIN' && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">📊</span>
              <span>Dashboard Overview</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">👥</span>
              <span>Manage Users</span>
            </NavLink>
            <NavLink
              to="/admin/stores"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🏪</span>
              <span>Manage Stores</span>
            </NavLink>
          </>
        )}

        {user.role === 'USER' && (
          <>
            <NavLink
              to="/user/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🏠</span>
              <span>Home Dashboard</span>
            </NavLink>
            <NavLink
              to="/user/stores"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🛍️</span>
              <span>Stores & Ratings</span>
            </NavLink>
          </>
        )}

        {user.role === 'OWNER' && (
          <>
            <NavLink
              to="/owner/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🏪</span>
              <span>Store Dashboard</span>
            </NavLink>
            <NavLink
              to="/owner/ratings"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">⭐</span>
              <span>Customer Ratings</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer-card">
        <div className="user-avatar-circle">{user.name.charAt(0)}</div>
        <div className="user-snippet">
          <p className="snippet-name">{user.name}</p>
          <p className="snippet-email">{user.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
