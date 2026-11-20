import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        navigate(getDashboardPath(data.user.role));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⭐</div>
          <h2>Sign In to Your Account</h2>
          <p>Common portal for Administrators, Store Owners, and Users</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. priyanka@bengaluruhub.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Register as Normal User
            </Link>
          </p>
        </div>

        {/* Demo Credentials Helper Box for quick testing */}
        <div className="demo-credentials-box">
          <div className="demo-title">⚡ Quick Test Accounts (Bangalore Hub - 1-Click Fill)</div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => fillDemoCredentials('admin@bengalurustores.in', 'Admin@12345')}
            >
              👑 Fill Admin (Prashant)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => fillDemoCredentials('rajesh@koramangalatech.in', 'Owner@12345')}
            >
              🏪 Fill Store Owner (Rajesh)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => fillDemoCredentials('priyanka@bengaluruhub.in', 'User@12345')}
            >
              👤 Fill User (Priyanka)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
