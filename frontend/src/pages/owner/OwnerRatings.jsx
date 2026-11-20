import React, { useState, useEffect } from 'react';
import { ownerService } from '../../services/api';
import DataTable from '../../components/DataTable';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';

const OwnerRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ownerService.getRatings();
      if (res.success) {
        setRatings(res.ratings || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer ratings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      r.user_name.toLowerCase().includes(term) ||
      r.user_email.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: 'user_name',
      label: 'Customer Name',
      sortable: false,
      render: (val, row) => (
        <div>
          <strong>{val}</strong>
          <div className="table-subtext">{row.user_email}</div>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Submitted Rating',
      sortable: false,
      render: (val) => (
        <div className="flex-items-center gap-2">
          <RatingStars rating={val} size="sm" showBadge={false} />
          <span className="rating-badge-inline">{val} / 5 Stars</span>
        </div>
      )
    },
    {
      key: 'updated_at',
      label: 'Date Reviewed',
      sortable: false,
      render: (val) => (val ? new Date(val).toLocaleString() : '—')
    }
  ];

  return (
    <div className="page-content-wrapper">
      <div className="page-header">
        <h1>Customers Who Rated Your Store</h1>
        <p className="page-subtitle">Detailed breakdown of verified customers and their submitted ratings for your store</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-controls-bar">
        <div className="search-input-wrapper max-w-sm">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ratings-total-pill">
          Total Reviews: <strong>{ratings.length}</strong>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading customer ratings..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredRatings}
          emptyMessage="No customer ratings found for your store."
        />
      )}
    </div>
  );
};

export default OwnerRatings;
