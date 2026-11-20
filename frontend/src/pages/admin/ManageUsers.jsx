import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });
  const [addErrors, setAddErrors] = useState([]);
  const [addLoading, setAddLoading] = useState(false);

  // View User Details Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsData, setUserDetailsData] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        role: roleFilter,
        sortBy,
        sortOrder
      });

      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list.');
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

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Open User Details
  const handleViewDetails = async (userId) => {
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);
    setUserDetailsData(null);
    try {
      const res = await adminService.getUserById(userId);
      if (res.success) {
        setSelectedUser(res.user);
        setUserDetailsData(res);
      }
    } catch (err) {
      setError('Failed to fetch user profile details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Add User Form Submission
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddErrors([]);

    // Client-side validations
    const errors = [];
    if (!formData.name || formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      errors.push('Name must be between 20 and 60 characters.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('A valid email address is required.');
    }
    const pwd = formData.password;
    if (!pwd || pwd.length < 8 || pwd.length > 16) {
      errors.push('Password must be between 8 and 16 characters in length.');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('Password must contain at least one special character.');
    }
    if (!formData.address || formData.address.trim().length === 0) {
      errors.push('Address is required.');
    } else if (formData.address.trim().length > 400) {
      errors.push('Address must not exceed 400 characters.');
    }

    if (errors.length > 0) {
      setAddErrors(errors);
      return;
    }

    setAddLoading(true);
    try {
      const res = await adminService.createUser(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', address: '', role: 'USER' });
        fetchUsers();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setAddErrors(err.response.data.errors.map((e) => e.message));
      } else {
        setAddErrors([err.response?.data?.message || 'Failed to create user account.']);
      }
    } finally {
      setAddLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'name',
      label: 'Full Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <strong>{val}</strong>
          <div className="table-subtext">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => {
        let badgeClass = 'badge-user';
        if (val === 'ADMIN') badgeClass = 'badge-admin';
        if (val === 'OWNER') badgeClass = 'badge-owner';
        return <span className={`role-badge ${badgeClass}`}>{val}</span>;
      }
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => <span className="table-address-clamp" title={val}>{val}</span>
    },
    {
      key: 'created_at',
      label: 'Registered On',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—')
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          className="btn btn-outline btn-xs"
          onClick={() => handleViewDetails(row.id)}
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="page-content-wrapper">
      <div className="page-header flex-header">
        <div>
          <h1>User Management Directory</h1>
          <p className="page-subtitle">Inspect, filter, sort, and register system administrators, store owners, and normal users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          ➕ Add New User
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter and Search Bar Row */}
      <div className="table-controls-bar">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name, email, or address..."
          initialValue={search}
        />
        <div className="filter-group">
          <label className="filter-label" htmlFor="roleFilterSelect">Filter by Role:</label>
          <select
            id="roleFilterSelect"
            className="form-control select-control"
            value={roleFilter}
            onChange={handleRoleFilter}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">STORE OWNER</option>
            <option value="USER">NORMAL USER</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Querying user records..." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage="No users found matching your search and filter criteria."
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal: Add New User */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New User Account"
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
              form="addUserForm"
              className="btn btn-primary"
              disabled={addLoading}
            >
              {addLoading ? 'Creating User...' : 'Create Account'}
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
        <form id="addUserForm" onSubmit={handleAddUserSubmit} className="standard-form">
          <div className="form-group">
            <label className="form-label" htmlFor="newUserName">Full Name (20 - 60 Characters)</label>
            <input
              id="newUserName"
              type="text"
              className="form-control"
              placeholder="e.g. Prashant Choudhary Admin Head"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <small className="form-hint">Current length: {formData.name.length} chars (Min 20, Max 60)</small>
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label className="form-label" htmlFor="newUserEmail">Email Address</label>
              <input
                id="newUserEmail"
                type="email"
                className="form-control"
                placeholder="e.g. rajesh@koramangalatech.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group form-col">
              <label className="form-label" htmlFor="newUserRole">Account Role</label>
              <select
                id="newUserRole"
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">USER (Normal User)</option>
                <option value="OWNER">OWNER (Store Owner)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newUserPassword">Initial Password</label>
            <input
              id="newUserPassword"
              type="password"
              className="form-control"
              placeholder="8 - 16 chars, 1 uppercase, 1 special character"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newUserAddress">Address (Max 400 Characters)</label>
            <textarea
              id="newUserAddress"
              className="form-control textarea-control"
              rows="3"
              placeholder="e.g. Plot No. 124, 5th Main Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal: View User Details */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="User Profile & Audit Details"
        footer={
          <button className="btn btn-outline" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </button>
        }
      >
        {detailsLoading || !selectedUser ? (
          <LoadingSpinner message="Fetching user details..." />
        ) : (
          <div className="details-container">
            <div className="details-grid">
              <div className="details-item">
                <span className="details-key">User ID:</span>
                <span className="details-val">#{selectedUser.id}</span>
              </div>
              <div className="details-item">
                <span className="details-key">Role:</span>
                <span className="details-val">
                  <span className={`role-badge badge-${selectedUser.role.toLowerCase()}`}>
                    {selectedUser.role}
                  </span>
                </span>
              </div>
              <div className="details-item full-width">
                <span className="details-key">Full Name:</span>
                <span className="details-val font-semibold">{selectedUser.name}</span>
              </div>
              <div className="details-item full-width">
                <span className="details-key">Email:</span>
                <span className="details-val">{selectedUser.email}</span>
              </div>
              <div className="details-item full-width">
                <span className="details-key">Physical Address:</span>
                <span className="details-val">{selectedUser.address}</span>
              </div>
              <div className="details-item">
                <span className="details-key">Joined On:</span>
                <span className="details-val">{new Date(selectedUser.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* If OWNER: Show their store */}
            {selectedUser.role === 'OWNER' && userDetailsData?.store && (
              <div className="associated-section mt-4">
                <h4>🏪 Registered Store Assignment</h4>
                <div className="sub-card">
                  <p><strong>Store:</strong> {userDetailsData.store.name}</p>
                  <p><strong>Email:</strong> {userDetailsData.store.email}</p>
                  <p><strong>Address:</strong> {userDetailsData.store.address}</p>
                  <p><strong>Store Average Rating:</strong> ⭐ {userDetailsData.store.average_rating} ({userDetailsData.store.total_ratings} reviews)</p>
                </div>
              </div>
            )}

            {/* If USER: Show their submitted ratings */}
            {selectedUser.role === 'USER' && userDetailsData?.ratings && (
              <div className="associated-section mt-4">
                <h4>⭐ Submitted Reviews & Ratings ({userDetailsData.ratings.length})</h4>
                {userDetailsData.ratings.length === 0 ? (
                  <p className="text-muted">This user has not submitted any store ratings yet.</p>
                ) : (
                  <div className="mini-ratings-list">
                    {userDetailsData.ratings.map((r) => (
                      <div key={r.id} className="mini-rating-item">
                        <span className="store-name-tag">{r.store_name}</span>
                        <span className="rating-tag">⭐ {r.rating} / 5</span>
                        <span className="rating-date-tag">{new Date(r.updated_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
