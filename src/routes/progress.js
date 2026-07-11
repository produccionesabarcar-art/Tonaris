const express = require('express');
const router = express.Router();
const { getUserProgress } = require('../controllers/progress');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', authenticate, getUserProgress);

module.exports = router;