const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validate } = require('../validators/authValidators');
const {
  adminCreateUserValidationRules,
  adminCreateStoreValidationRules
} = require('../validators/adminValidators');

// Protect all admin routes with authentication and strict ADMIN role authorization
router.use(authenticateToken, authorizeRoles('ADMIN'));

// Dashboard metrics
router.get('/dashboard', AdminController.getDashboard);

// User Management
router.post('/users', validate(adminCreateUserValidationRules), AdminController.createUser);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);

// Store Management
router.post('/stores', validate(adminCreateStoreValidationRules), AdminController.createStore);
router.get('/stores', AdminController.getStores);
router.get('/stores/:id', AdminController.getStoreById);

module.exports = router;
