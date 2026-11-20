const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const {
  validate,
  registerValidationRules,
  loginValidationRules,
  changePasswordValidationRules
} = require('../validators/authValidators');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', validate(registerValidationRules), authController.register);
router.post('/login', validate(loginValidationRules), authController.login);

// Protected routes (Require valid JWT)
router.get('/me', authenticateToken, authController.getMe);
router.put('/change-password', authenticateToken, validate(changePasswordValidationRules), authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
