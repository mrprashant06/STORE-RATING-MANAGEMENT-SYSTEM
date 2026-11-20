import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setGeneralError('');
  };

  const validateForm = () => {
    const errors = [];

    // Name: 20 - 60 chars
    if (!formData.name || formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      errors.push('Name must be between 20 and 60 characters in length.');
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address.');
    }

    // Password: 8 - 16 chars, 1 uppercase, 1 special char
    const password = formData.password;
    if (!password || password.length < 8 || password.length > 16) {
      errors.push('Password must be between 8 and 16 characters in length.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character (e.g. !@#$%).');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    // Address: max 400 chars
    if (!formData.address || formData.address.trim().length === 0) {
      errors.push('Address is required.');
    } else if (formData.address.trim().length > 400) {
      errors.push('Address must not exceed 400 characters.');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setValidationErrors([]);

    const clientErrors = validateForm();
    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim()
      });

      if (data.success) {
        navigate(getDashboardPath(data.user.role));
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors.map((e) => e.message));
      } else {
        setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">👤</div>
          <h2>Create User Account</h2>
          <p>Register as a Normal User to browse stores and submit ratings</p>
        </div>

        {generalError && <div className="alert alert-error">{generalError}</div>}

        {validationErrors.length > 0 && (
          <div className="alert alert-error">
            <ul className="error-list">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="label-with-counter">
              <label className="form-label" htmlFor="name">Full Name</label>
              <span className={`counter-text ${formData.name.length < 20 || formData.name.length > 60 ? 'invalid' : 'valid'}`}>
                {formData.name.length} / 60 (Min 20)
              </span>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Priyanka Radhakrishnan Iyer"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <small className="form-hint">Must be between 20 and 60 characters.</small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. priyanka.iyer@bengaluruhub.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="8 - 16 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <small className="form-hint">8-16 chars, 1 uppercase, 1 special symbol</small>
            </div>

            <div className="form-group form-col">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-counter">
              <label className="form-label" htmlFor="address">Physical Address</label>
              <span className={`counter-text ${formData.address.length > 400 ? 'invalid' : 'valid'}`}>
                {formData.address.length} / 400
              </span>
            </div>
            <textarea
              id="address"
              name="address"
              className="form-control textarea-control"
              rows="3"
              placeholder="e.g. Flat 402, Sobha Iris, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
