const express = require('express');
const router = express.Router();
const { getUserProgress } = require('../controllers/progress');

router.get('/:userId', getUserProgress);

module.exports = router;