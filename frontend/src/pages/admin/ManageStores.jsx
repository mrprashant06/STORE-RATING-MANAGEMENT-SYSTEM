import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Store Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [storeFormData, setStoreFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [availableOwners, setAvailableOwners] = useState([]);
  const [addErrors, setAddErrors] = useState([]);
  const [addLoading, setAddLoading] = useState(false);

  // View Store Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [pagination.page, search, sortBy, sortOrder]);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStores({
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
      setError(err.response?.data?.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnKey);
      setSortOrder('ASC');
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Open "Add Store" modal & load available store owners
  const openAddStoreModal = async () => {
    setIsAddModalOpen(true);
    setAddErrors([]);
    try {
      const res = await adminService.getUsers({ role: 'OWNER', limit: 100 });
      if (res.success) {
        setAvailableOwners(res.users);
        if (res.users.length > 0) {
          setStoreFormData((prev) => ({ ...prev, owner_id: res.users[0].id }));
        }
      }
    } catch (e) {
      console.warn('Could not load owners list.');
    }
  };

  // Handle Add Store submission
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setAddErrors([]);

    const errors = [];
    if (!storeFormData.name || storeFormData.name.trim().length < 20 || storeFormData.name.trim().length > 60) {
      errors.push('Store name must be between 20 and 60 characters in length.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!storeFormData.email || !emailRegex.test(storeFormData.email)) {
      errors.push('Valid store email address is required.');
    }
    if (!storeFormData.address || storeFormData.address.trim().length === 0) {
      errors.push('Store address is required.');
    } else if (storeFormData.address.trim().length > 400) {
      errors.push('Store address cannot exceed 400 characters.');
    }
    if (!storeFormData.owner_id) {
      errors.push('Please select a Store Owner.');
    }

    if (errors.length > 0) {
      setAddErrors(errors);
      return;
    }

    setAddLoading(true);
    try {
      const res = await adminService.createStore({
        ...storeFormData,
        owner_id: parseInt(storeFormData.owner_id, 10)
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setStoreFormData({ name: '', email: '', address: '', owner_id: '' });
        fetchStores();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setAddErrors(err.response.data.errors.map((e) => e.message));
      } else {
        setAddErrors([err.response?.data?.message || 'Failed to create store.']);
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Open Store Details Modal
  const handleViewStoreDetails = async (storeId) => {
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);
    setSelectedStore(null);
    setStoreRatings([]);

    try {
      const res = await adminService.getStoreById(storeId);
      if (res.success) {
        setSelectedStore(res.store);
        setStoreRatings(res.ratings || []);
      }
    } catch (err) {
      setError('Failed to fetch store details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <strong>{val}</strong>
          <div className="table-subtext">{row.email}</div>
        </div>
      )
    },
    {
      key: 'owner_name',
      label: 'Assigned Owner',
      sortable: false,
      render: (val, row) => (
        <div>
          <span>{val || 'Unassigned'}</span>
          {row.owner_email && <div className="table-subtext">{row.owner_email}</div>}
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => <span className="table-address-clamp" title={val}>{val}</span>
    },
    {
      key: 'average_rating',
      label: 'Average Rating',
      sortable: true,
      render: (val, row) => (
        <RatingStars rating={val} count={row.total_ratings} size="sm" />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          className="btn btn-outline btn-xs"
          onClick={() => handleViewStoreDetails(row.id)}
        >
          View Details & Reviews
        </button>
      )
    }
  ];

  return (
    <div className="page-content-wrapper">
      <div className="page-header flex-header">
        <div>
          <h1>Store Management Directory</h1>
          <p className="page-subtitle">Oversee registered retail stores, owner associations, and customer rating distributions</p>
        </div>
        <button className="btn btn-primary" onClick={openAddStoreModal}>
          ➕ Add New Store
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-controls-bar">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search stores by name, email, or address..."
          initialValue={search}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Querying stores directory..." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={stores}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage="No stores found matching your criteria."
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal: Add Store */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Retail Store"
        footer={
          <div className="flex-buttons-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addStoreForm"
              className="btn btn-primary"
              disabled={addLoading}
            >
              {addLoading ? 'Saving Store...' : 'Create Store'}
            </button>
          </div>
        }
      >
        {addErrors.length > 0 && (
          <div className="alert alert-error">
            <ul className="error-list">
              {addErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form id="addStoreForm" onSubmit={handleAddStoreSubmit} className="standard-form">
          <div className="form-group">
            <label className="form-label" htmlFor="newStoreName">Store Name (20 - 60 Characters)</label>
            <input
              id="newStoreName"
              type="text"
              className="form-control"
              placeholder="e.g. Koramangala Tech Gadgets MegaStore"
              value={storeFormData.name}
              onChange={(e) => setStoreFormData({ ...storeFormData, name: e.target.value })}
              required
            />
            <small className="form-hint">Current: {storeFormData.name.length} chars (Min 20, Max 60)</small>
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label className="form-label" htmlFor="newStoreEmail">Contact Email</label>
              <input
                id="newStoreEmail"
                type="email"
                className="form-control"
                placeholder="e.g. contact@koramangalatech.in"
                value={storeFormData.email}
                onChange={(e) => setStoreFormData({ ...storeFormData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group form-col">
              <label className="form-label" htmlFor="newStoreOwner">Designated Store Owner</label>
              <select
                id="newStoreOwner"
                className="form-control"
                value={storeFormData.owner_id}
                onChange={(e) => setStoreFormData({ ...storeFormData, owner_id: e.target.value })}
                required
              >
                {availableOwners.length === 0 ? (
                  <option value="">No Store Owners available. Create one first.</option>
                ) : (
                  availableOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newStoreAddress">Physical Address (Max 400 Characters)</label>
            <textarea
              id="newStoreAddress"
              className="form-control textarea-control"
              rows="3"
              placeholder="e.g. Shop No. 12, Ground Floor, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034"
              value={storeFormData.address}
              onChange={(e) => setStoreFormData({ ...storeFormData, address: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal: View Store Details & User Reviews */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Store Details & Reviews Audit"
        footer={
          <button className="btn btn-outline" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </button>
        }
      >
        {detailsLoading || !selectedStore ? (
          <LoadingSpinner message="Loading store data..." />
        ) : (
          <div className="details-container">
            <div className="details-grid">
              <div className="details-item full-width">
                <span className="details-key">Store Name:</span>
                <span className="details-val font-semibold">{selectedStore.name}</span>
              </div>
              <div className="details-item">
                <span className="details-key">Contact Email:</span>
                <span className="details-val">{selectedStore.email}</span>
              </div>
              <div className="details-item">
                <span className="details-key">Assigned Owner:</span>
                <span className="details-val">{selectedStore.owner_name} ({selectedStore.owner_email})</span>
              </div>
              <div className="details-item full-width">
                <span className="details-key">Physical Location:</span>
                <span className="details-val">{selectedStore.address}</span>
              </div>
              <div className="details-item full-width">
                <span className="details-key">Overall Rating:</span>
                <span className="details-val">
                  <RatingStars rating={selectedStore.average_rating} count={selectedStore.total_ratings} size="md" />
                </span>
              </div>
            </div>

            <div className="associated-section mt-4">
              <h4>💬 Submitted User Ratings ({storeRatings.length})</h4>
              {storeRatings.length === 0 ? (
                <p className="text-muted">No customer ratings have been submitted for this store yet.</p>
              ) : (
                <div className="reviews-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Submitted On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeRatings.map((r) => (
                        <tr key={r.id}>
                          <td><strong>{r.user_name}</strong></td>
                          <td>{r.user_email}</td>
                          <td>
                            <RatingStars rating={r.rating} showBadge={false} size="sm" />
                            <span className="rating-badge-inline">{r.rating} / 5</span>
                          </td>
                          <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageStores;
