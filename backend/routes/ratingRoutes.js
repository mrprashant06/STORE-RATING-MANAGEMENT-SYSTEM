const express = require('express');
const router = express.Router();

const RatingController = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validate } = require('../validators/authValidators');
const {
  submitRatingValidationRules,
  updateRatingValidationRules
} = require('../validators/ratingValidators');

// Protect rating actions: must be logged in as USER (or ADMIN)
router.use(authenticateToken, authorizeRoles('USER', 'ADMIN'));

// Submit a new rating
router.post('/', validate(submitRatingValidationRules), RatingController.submitRating);

// Update an existing rating for a store
router.put('/:storeId', validate(updateRatingValidationRules), RatingController.updateRating);

module.exports = router;
