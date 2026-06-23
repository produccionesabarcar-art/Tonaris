const { sessions } = require('./sessions');

/**
 * Obtiene el progreso de un usuario.
 * GET /api/progress/:userId
 */
function getUserProgress(req, res) {
  const { userId } = req.params;
  const userSessions = sessions.filter(s => s.userId === userId);

  if (userSessions.length === 0) {
    return res.status(404).json({ error: 'No hay sesiones para este usuario.' });
  }

  const totalSessions = userSessions.length;
  const avgAccuracy = Math.round(
    userSessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions
  );
  const bestAccuracy = Math.max(...userSessions.map(s => s.accuracy));
  const totalCorrect = userSessions.reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = userSessions.reduce((sum, s) => sum + s.total, 0);

  res.json({
    userId,
    totalSessions,
    avgAccuracy,
    bestAccuracy,
    totalCorrect,
    totalQuestions,
    lastSession: userSessions[userSessions.length - 1].createdAt
  });
}

module.exports = { getUserProgress };