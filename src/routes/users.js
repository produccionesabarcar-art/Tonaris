const express = require('express');
const router = express.Router();
const { register, login, getById } = require('../controllers/users');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/:userId', authenticate, getById);

module.exports = router;