const express = require('express');
const router = express.Router();
const { createSession, getSessionsByUser } = require('../controllers/sessions');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createSession);
router.get('/:userId', authenticate, getSessionsByUser);

module.exports = router;