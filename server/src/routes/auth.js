const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Name can only contain alphabetic letters and spaces')
      .custom(val => {
        if (!/[a-zA-Z]{2,}/.test(val)) {
          throw new Error('Name must contain real words with at least 2 consecutive letters');
        }
        return true;
      }),
    body('email')
      .trim()
      .isEmail().withMessage('Please provide a valid email address')
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage('Email username must start with an alphanumeric letter/number')
      .custom(val => {
        const domain = val.split('@')[1] || '';
        if (domain.startsWith('.') || domain.endsWith('.') || !domain.includes('.')) {
          throw new Error('Invalid email domain');
        }
        return true;
      }),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
