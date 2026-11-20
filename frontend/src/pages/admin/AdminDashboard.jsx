import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Administrator Metrics..." />;
  }

  return (
    <div className="page-content-wrapper">
      <div className="page-header">
        <div className="header-badge">ADMINISTRATION PORTAL</div>
        <h1>System Overview Dashboard</h1>
        <p className="page-subtitle">Real-time statistics across all users, stores, and ratings</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Metric Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-users">
          <div className="stat-icon-wrapper">👥</div>
          <div className="stat-content">
            <span className="stat-label">Total Registered Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-sub">Admins, Owners & Consumers</span>
          </div>
          <Link to="/admin/users" className="stat-card-link">View Users &rarr;</Link>
        </div>

        <div className="stat-card stat-stores">
          <div className="stat-icon-wrapper">🏪</div>
          <div className="stat-content">
            <span className="stat-label">Total Stores</span>
            <span className="stat-value">{stats.totalStores}</span>
            <span className="stat-sub">Active Registered Stores</span>
          </div>
          <Link to="/admin/stores" className="stat-card-link">View Stores &rarr;</Link>
        </div>

        <div className="stat-card stat-ratings">
          <div className="stat-icon-wrapper">⭐</div>
          <div className="stat-content">
            <span className="stat-label">Submitted Ratings</span>
            <span className="stat-value">{stats.totalRatings}</span>
            <span className="stat-sub">Cumulative Store Reviews</span>
          </div>
          <Link to="/admin/stores" className="stat-card-link">Explore Ratings &rarr;</Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="section-title-wrapper mt-8">
        <h2>Administrative Management Hub</h2>
      </div>

      <div className="admin-actions-grid">
        <div className="action-card">
          <div className="action-card-header">
            <span className="action-emoji">👥</span>
            <h3>User Directory & Permissions</h3>
          </div>
          <p>
            Review all registered users, filter by role (ADMIN, USER, OWNER), search across credentials,
            and create new accounts.
          </p>
          <div className="action-buttons">
            <Link to="/admin/users" className="btn btn-primary">
              Manage Users Directory
            </Link>
          </div>
        </div>

        <div className="action-card">
          <div className="action-card-header">
            <span className="action-emoji">🏪</span>
            <h3>Store Management & Aggregations</h3>
          </div>
          <p>
            Create new physical and retail store profiles, bind them to registered Store Owners, and monitor real-time review averages.
          </p>
          <div className="action-buttons">
            <Link to="/admin/stores" className="btn btn-primary">
              Manage Stores & Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
