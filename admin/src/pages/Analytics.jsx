import { useState } from 'react';
import { apiFetch } from '../api/client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function Analytics() {
  const [userId, setUserId] = useState('');
  const [streak, setStreak] = useState(null);
  const [history, setHistory] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setStreak(null);
    setHistory([]);
    setIntervals([]);
    try {
      const [streakData, historyData, intervalsData] = await Promise.all([
        apiFetch(`/analytics/streak/${userId}`),
        apiFetch(`/analytics/history/${userId}`),
        apiFetch(`/analytics/intervals/${userId}`),
      ]);
      setStreak(calcStreak(streakData.data));
      setHistory(historyData.data.map(s => ({
        ...s,
        fecha: new Date(s.created_at).toLocaleDateString()
      })));
      setIntervals(intervalsData.data);
    } catch (err) {
      setError(err.message);
    }
  }

  function calcStreak(days) {
    if (!days.length) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < days.length; i++) {
      const day = new Date(days[i].day);
      const diff = Math.round((today - day) / (1000 * 60 * 60 * 24));
      if (diff === i) streak++;
      else break;
    }
    return streak;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Analítica</h2>
      <div style={styles.search}>
        <input
          style={styles.input}
          placeholder="ID de usuario"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button style={styles.button} onClick={handleSearch}>Buscar</button>
      </div>
      {error && <p style={styles.error}>{error}</p>}

      {streak !== null && (
        <div style={styles.streakCard}>
          <p style={styles.streakLabel}>Racha actual</p>
          <p style={styles.streakValue}>🔥 {streak} {streak === 1 ? 'día' : 'días'}</p>
        </div>
      )}

      {history.length > 0 && (
        <div style={styles.chartBox}>
          <h3 style={styles.subtitle}>Precisión por sesión</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid stroke="#1a1a1a" />
              <XAxis dataKey="fecha" stroke="#aaa" tick={{ fontSize: 11 }} />
              <YAxis stroke="#aaa" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: 'none', color: '#fff' }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#fff" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {intervals.length > 0 && (
        <div>
          <h3 style={styles.subtitle}>Precisión por intervalo</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Intervalo</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Correctas</th>
                <th style={styles.th}>Precisión</th>
              </tr>
            </thead>
            <tbody>
              {intervals.map(i => (
                <tr key={i.interval}>
                  <td style={styles.td}>{i.interval}</td>
                  <td style={styles.td}>{i.total}</td>
                  <td style={styles.td}>{i.correct}</td>
                  <td style={styles.td}>{i.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem' },
  title: { color: '#fff', marginBottom: '1rem' },
  subtitle: { color: '#fff', margin: '1.5rem 0 0.75rem' },
  search: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  input: { padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid #333', background: '#0f0f0f', color: '#fff', fontSize: '0.875rem', width: '240px' },
  button: { padding: '0.6rem 1.5rem', borderRadius: '4px', border: 'none', background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.875rem' },
  error: { color: '#ff4444' },
  streakCard: { background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', display: 'inline-block', marginBottom: '1.5rem' },
  streakLabel: { color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  streakValue: { color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: 0 },
  chartBox: { marginBottom: '1.5rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #333', color: '#aaa', fontSize: '0.875rem' },
  td: { padding: '0.75rem', borderBottom: '1px solid #1a1a1a', color: '#fff', fontSize: '0.875rem' },
};