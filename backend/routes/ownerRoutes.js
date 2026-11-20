const express = require('express');
const router = express.Router();

const OwnerController = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all owner routes: must be authenticated and have OWNER role
router.use(authenticateToken, authorizeRoles('OWNER'));

// Owner dashboard statistics
router.get('/dashboard', OwnerController.getDashboard);

// List of users who rated owner's store
router.get('/ratings', OwnerController.getRatings);

// Average rating endpoint
router.get('/average-rating', OwnerController.getAverageRating);

module.exports = router;
