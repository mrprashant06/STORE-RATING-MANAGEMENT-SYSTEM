const { body } = require('express-validator');

/**
 * Validation rules for Administrator creating a new user (can be ADMIN, USER, or OWNER)
 */
const adminCreateUserValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters in length.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters in length.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('role')
    .isIn(['ADMIN', 'USER', 'OWNER'])
    .withMessage('Role must be one of: ADMIN, USER, OWNER.')
];

/**
 * Validation rules for Administrator creating a new store
 */
const adminCreateStoreValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters in length.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid store email address.')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required.')
    .isLength({ max: 400 })
    .withMessage('Store address must not exceed 400 characters.'),
  body('owner_id')
    .isInt({ min: 1 })
    .withMessage('A valid Store Owner ID must be specified.')
];

module.exports = {
  adminCreateUserValidationRules,
  adminCreateStoreValidationRules
};
