import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerService } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await ownerService.getDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Store Dashboard..." />;
  }

  const store = dashboardData?.store;
  const stats = dashboardData?.stats;

  return (
    <div className="page-content-wrapper">
      <div className="page-header">
        <div className="header-badge">STORE OWNER PORTAL</div>
        <h1>Store Management Dashboard</h1>
        <p className="page-subtitle">Real-time performance metrics and reputation analysis for your retail store</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!store ? (
        <div className="card empty-state">
          <span className="empty-icon">🏪</span>
          <h3>No Store Assigned Yet</h3>
          <p>
            Your account does not have a store bound to it currently. 
            Please contact the System Administrator to register and link your store.
          </p>
        </div>
      ) : (
        <>
          {/* Main Store Identity Card */}
          <div className="owner-store-hero card">
            <div className="store-hero-left">
              <span className="store-pill">OFFICIAL STORE PROFILE</span>
              <h2>{store.name}</h2>
              <p className="store-hero-address">📍 {store.address}</p>
              <p className="store-hero-email">📧 {store.email}</p>
            </div>

            <div className="store-hero-right">
              <div className="average-rating-display">
                <span className="big-rating-number">{stats?.averageRating || '0.0'}</span>
                <RatingStars rating={stats?.averageRating} size="lg" showBadge={false} />
                <span className="total-reviews-count">Based on {stats?.totalRatings || 0} customer reviews</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="stats-grid mt-6">
            <div className="stat-card">
              <div className="stat-icon-wrapper">⭐</div>
              <div className="stat-content">
                <span className="stat-label">Average Store Rating</span>
                <span className="stat-value">{stats?.averageRating || '0.0'} / 5.0</span>
                <span className="stat-sub">Overall community score</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">👥</div>
              <div className="stat-content">
                <span className="stat-label">Total Reviewers</span>
                <span className="stat-value">{stats?.totalRatings || 0}</span>
                <span className="stat-sub">Customers who submitted ratings</span>
              </div>
            </div>
          </div>

          <div className="section-title-wrapper mt-8">
            <h2>Customer Reviews & Reputation</h2>
            <Link to="/owner/ratings" className="btn btn-primary">
              📋 View Full Customer Review Log &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
