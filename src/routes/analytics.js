const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics');

const router = express.Router();

// Rutas de Analítica — todas requieren autenticación
router.get('/streak/:userId', authenticate, analyticsController.getStreak);
router.get('/history/:userId', authenticate, analyticsController.getHistory);
router.get('/intervals/:userId', authenticate, analyticsController.getIntervals);
router.get('/summary/:userId', authenticate, analyticsController.getSummary);
router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/trend/:userId/:skillId', authenticate, analyticsController.getTrend);
router.get('/mastery/:userId', authenticate, analyticsController.getMastery);
router.patch('/daily-goal/:userId', authenticate, analyticsController.updateDailyGoal);

module.exports = router;