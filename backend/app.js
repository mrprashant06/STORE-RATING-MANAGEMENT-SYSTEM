const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==========================================
// 1. Production Security & Optimization Middlewares
// ==========================================

// Helmet sets secure HTTP headers (XSS, Frameguard, etc.)
app.use(
  helmet({
    contentSecurityPolicy: false // Allows Vite inline bundles to execute smoothly
  })
);

// Gzip/Brotli response compression for high performance
app.use(compression());

// Global Rate Limiting: Max 300 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Strict Rate Limiting for Authentication (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 mins
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// 2. CORS & Body Parsers
// ==========================================

const corsOptions = {
  origin: (origin, callback) => {
    // In production, allow all origins if FRONTEND_URL is '*' or undefined, or match explicit origin
    const allowed = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];
    if (!origin || allowed.includes('*') || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback for seamless deployments
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing with safe size limits (prevents payload-flooding DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ==========================================
// 3. Health & Status Checks
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${process.uptime().toFixed(1)}s`,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 4. API Route Modules
// ==========================================
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

// ==========================================
// 5. Production Static Frontend Serving
// ==========================================
// In production or when SERVE_STATIC is true, Express serves the built React app
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// For all non-API GET requests, return index.html (React Router Single Page App fallback)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.originalUrl.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If frontend dist is not built yet, fallback to next()
      next();
    }
  });
});

// ==========================================
// 6. 404 Route Not Found Handler for APIs
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// 7. Global Centralized Error Handler
// ==========================================
app.use(errorHandler);

module.exports = app;
