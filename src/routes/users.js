const express = require('express');
const router = express.Router();
const { register, login, getById, getAll, updateAlias } = require('../controllers/users');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/all', authenticate, authorizeAdmin, getAll);
router.get('/:userId', authenticate, getById);
router.patch('/:userId/alias', authenticate, updateAlias);

module.exports = router;