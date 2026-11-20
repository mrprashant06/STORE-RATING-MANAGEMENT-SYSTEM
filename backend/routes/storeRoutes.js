const express = require('express');
const router = express.Router();

const StoreController = require('../controllers/storeController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Get all stores with optional user-specific rating inclusion
router.get('/', optionalAuth, StoreController.getStores);

// Get single store details
router.get('/:id', optionalAuth, StoreController.getStoreById);

module.exports = router;
