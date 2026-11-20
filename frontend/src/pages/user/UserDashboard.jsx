import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await storeService.getStores({ limit: 4, sortBy: 'average_rating', sortOrder: 'DESC' });
      if (res.success) {
        setFeaturedStores(res.stores);
      }
    } catch (e) {
      console.warn('Could not load featured stores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content-wrapper">
      <div className="page-header">
        <div className="header-badge">CONSUMER PORTAL</div>
        <h1>Welcome, {user?.name}!</h1>
        <p className="page-subtitle">Discover top-rated local retail stores, read reviews, and share your personal shopping experience</p>
      </div>

      <div className="user-welcome-banner">
        <div className="welcome-banner-text">
          <h2>Share Your Experience & Support Local Stores</h2>
          <p>
            Your feedback matters! You can rate each store from 1 to 5 stars and update your reviews whenever your experience changes.
          </p>
          <div className="banner-actions">
            <Link to="/user/stores" className="btn btn-primary btn-lg">
              🔍 Explore All Stores
            </Link>
          </div>
        </div>
      </div>

      <div className="section-title-wrapper mt-8">
        <h2>Top Rated Stores</h2>
        <Link to="/user/stores" className="view-all-link">View All Stores &rarr;</Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading popular stores..." />
      ) : (
        <div className="stores-cards-grid">
          {featuredStores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-card-header">
                <h3>{store.name}</h3>
                <span className="store-card-email">{store.email}</span>
              </div>
              <p className="store-card-address">📍 {store.address}</p>

              <div className="store-card-rating-box">
                <span className="rating-box-label">Community Rating:</span>
                <RatingStars rating={store.average_rating} count={store.total_ratings} size="md" />
              </div>

              {store.my_rating ? (
                <div className="my-rating-indicator rated">
                  <span>Your Submitted Rating: <strong>⭐ {store.my_rating} / 5</strong></span>
                </div>
              ) : (
                <div className="my-rating-indicator not-rated">
                  <span>You haven't reviewed this store yet</span>
                </div>
              )}

              <div className="store-card-footer">
                <Link to="/user/stores" className="btn btn-outline btn-block btn-sm">
                  {store.my_rating ? '✏️ Update Your Rating' : '⭐ Rate This Store'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
