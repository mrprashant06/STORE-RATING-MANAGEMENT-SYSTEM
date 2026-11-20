import React, { useState } from 'react';
import { authService } from '../../services/api';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setValidationErrors([]);

    const clientErrors = [];
    if (!currentPassword) {
      clientErrors.push('Current password is required.');
    }
    if (!newPassword || newPassword.length < 8 || newPassword.length > 16) {
      clientErrors.push('New password must be between 8 and 16 characters in length.');
    }
    if (!/[A-Z]/.test(newPassword)) {
      clientErrors.push('New password must contain at least one uppercase letter.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      clientErrors.push('New password must contain at least one special character.');
    }
    if (newPassword !== confirmPassword) {
      clientErrors.push('New passwords do not match.');
    }

    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setSuccessMsg(res.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors.map((e) => e.message));
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content-wrapper">
      <div className="page-header">
        <h1>Change Password</h1>
        <p className="page-subtitle">Update your credentials to maintain account security</p>
      </div>

      <div className="card max-w-md">
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        {validationErrors.length > 0 && (
          <div className="alert alert-error">
            <ul className="error-list">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8 - 16 characters"
              required
            />
            <small className="form-hint">Must be 8-16 chars, contain 1 uppercase letter and 1 special symbol</small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
