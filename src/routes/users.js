const express = require('express');
const router = express.Router();
const { registerUser, getUserById } = require('../controllers/users');

router.post('/register', registerUser);
router.get('/:userId', getUserById);

module.exports = router;