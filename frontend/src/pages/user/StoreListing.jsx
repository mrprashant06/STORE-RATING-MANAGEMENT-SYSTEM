import React, { useState, useEffect } from 'react';
import { storeService, ratingService } from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import RatingStars from '../../components/RatingStars';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const StoreListing = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    fetchStores();
  }, [pagination.page, search, sortBy, sortOrder]);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await storeService.getStores({
        page: pagination.page,
        limit: pagination.limit,
        search,
        sortBy,
        sortOrder
      });

      if (res.success) {
        setStores(res.stores);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stores directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Open Rating Modal
  const openRatingModal = (store) => {
    setActiveStore(store);
    setSelectedRating(store.my_rating || 5);
    setRatingError('');
    setIsRatingModalOpen(true);
  };

  // Submit or Update Rating
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!activeStore) return;

    setRatingSubmitting(true);
    setRatingError('');

    try {
      let res;
      if (activeStore.my_rating) {
        // Update existing rating
        res = await ratingService.updateRating(activeStore.id, { rating: selectedRating });
      } else {
        // Submit new rating
        res = await ratingService.submitRating({
          store_id: activeStore.id,
          rating: selectedRating
        });
      }

      if (res.success) {
        setIsRatingModalOpen(false);
        setSuccessToast(`Thank you! Your rating for "${activeStore.name}" was successfully saved.`);
        setTimeout(() => setSuccessToast(''), 5000);
        // Refresh store list to display updated rating and average
        fetchStores();
      }
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="page-content-wrapper">
      <div className="page-header">
        <h1>Store Directory & Ratings</h1>
        <p className="page-subtitle">Browse registered stores, search locations, and submit or modify your personal ratings</p>
      </div>

      {successToast && <div className="alert alert-success">{successToast}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search and Sort Toolbar */}
      <div className="table-controls-bar">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search stores by name or address..."
          initialValue={search}
        />

        <div className="filter-group">
          <label className="filter-label" htmlFor="userStoreSortSelect">Sort by:</label>
          <select
            id="userStoreSortSelect"
            className="form-control select-control"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <option value="id-DESC">Newest First</option>
            <option value="id-ASC">Oldest First</option>
            <option value="average_rating-DESC">Highest Rated</option>
            <option value="name-ASC">Store Name (A - Z)</option>
            <option value="name-DESC">Store Name (Z - A)</option>
          </select>
        </div>
      </div>

      {/* Main Stores Grid */}
      {loading ? (
        <LoadingSpinner message="Searching stores..." />
      ) : stores.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">🏪</span>
          <h3>No stores found</h3>
          <p>We could not find any stores matching "{search}". Try searching with a different term.</p>
        </div>
      ) : (
        <>
          <div className="stores-cards-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-card-header">
                  <h3>{store.name}</h3>
                  <span className="store-card-email">{store.email}</span>
                </div>

                <p className="store-card-address">
                  📍 {store.address}
                </p>

                <div className="store-card-rating-box">
                  <span className="rating-box-label">Community Rating:</span>
                  <RatingStars rating={store.average_rating} count={store.total_ratings} size="md" />
                </div>

                {store.my_rating ? (
                  <div className="my-rating-indicator rated">
                    <span>
                      Your Submitted Rating: <strong>⭐ {store.my_rating} / 5</strong>
                    </span>
                  </div>
                ) : (
                  <div className="my-rating-indicator not-rated">
                    <span>You have not reviewed this store yet</span>
                  </div>
                )}

                <div className="store-card-footer">
                  <button
                    className={`btn btn-block ${store.my_rating ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => openRatingModal(store)}
                  >
                    {store.my_rating ? '✏️ Modify Your Rating' : '⭐ Submit Rating'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal: Submit or Update Rating */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={activeStore?.my_rating ? `Update Rating for ${activeStore?.name}` : `Rate ${activeStore?.name}`}
        footer={
          <div className="flex-buttons-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsRatingModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="ratingForm"
              className="btn btn-primary"
              disabled={ratingSubmitting}
            >
              {ratingSubmitting ? 'Saving...' : activeStore?.my_rating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        }
      >
        {ratingError && <div className="alert alert-error">{ratingError}</div>}

        <form id="ratingForm" onSubmit={handleRatingSubmit} className="standard-form">
          <div className="rating-modal-prompt">
            <p>Select your rating for <strong>{activeStore?.name}</strong>:</p>
            <p className="store-address-hint">📍 {activeStore?.address}</p>
          </div>

          <div className="interactive-stars-container">
            <RatingStars
              rating={selectedRating}
              interactive={true}
              onChange={(newVal) => setSelectedRating(newVal)}
              size="lg"
              showBadge={false}
            />
            <div className="selected-score-display">
              <span className="score-num">{selectedRating}</span>
              <span className="score-label">out of 5 Stars</span>
            </div>
          </div>

          <div className="rating-scale-guide">
            <small>1 = Very Poor &bull; 2 = Poor &bull; 3 = Average &bull; 4 = Good &bull; 5 = Excellent</small>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoreListing;
