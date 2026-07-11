const express = require('express');
const router = express.Router();
const { register, login, getById, getAll, updateAlias, forgotPassword, resetPassword } = require('../controllers/users');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const authLimiter = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/all', authenticate, authorizeAdmin, getAll);
router.get('/:userId', authenticate, getById);
router.patch('/:userId/alias', authenticate, updateAlias);

module.exports = router;