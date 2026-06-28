import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/analytics/leaderboard')
      .then(res => setData(res.data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Leaderboard</h2>
      {error && <p style={styles.error}>{error}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Sesiones</th>
            <th style={styles.th}>Precisión promedio</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u, i) => (
            <tr key={u.user_id}>
              <td style={styles.td}>{i + 1}</td>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>{u.total_sessions}</td>
              <td style={styles.td}>{u.avg_accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: '2rem' },
  title: { color: '#fff', marginBottom: '1rem' },
  error: { color: '#ff4444' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #333', color: '#aaa', fontSize: '0.875rem' },
  td: { padding: '0.75rem', borderBottom: '1px solid #1a1a1a', color: '#fff', fontSize: '0.875rem' },
};