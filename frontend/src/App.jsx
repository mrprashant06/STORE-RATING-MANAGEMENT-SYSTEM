import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Protected Route
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Common Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangePassword from './pages/auth/ChangePassword';
import Unauthorized from './pages/auth/Unauthorized';
import NotFound from './pages/NotFound';

// Role-specific Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';

import UserDashboard from './pages/user/UserDashboard';
import StoreListing from './pages/user/StoreListing';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerRatings from './pages/owner/OwnerRatings';

// Root redirect helper based on authentication status
const RootRedirect = () => {
  const { isAuthenticated, user, getDashboardPath, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDashboardPath(user.role)} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated Layout Shell */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Common Authenticated Route */}
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Administrator Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageStores />
                </ProtectedRoute>
              }
            />

            {/* Normal User Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/stores"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                  <StoreListing />
                </ProtectedRoute>
              }
            />

            {/* Store Owner Routes */}
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['OWNER']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/ratings"
              element={
                <ProtectedRoute allowedRoles={['OWNER']}>
                  <OwnerRatings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
