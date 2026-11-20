const { body, param } = require('express-validator');

/**
 * Validation rules for submitting a rating
 */
const submitRatingValidationRules = [
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('A valid Store ID is required.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

/**
 * Validation rules for updating a rating
 */
const updateRatingValidationRules = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('A valid Store ID must be provided in the URL.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

module.exports = {
  submitRatingValidationRules,
  updateRatingValidationRules
};
