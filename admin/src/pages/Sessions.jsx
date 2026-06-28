import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setSessions([]);
    try {
      const data = await apiFetch(`/sessions/${userId}`);
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sesiones</h2>
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
      {sessions.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID Sesión</th>
              <th style={styles.th}>Tonalidad</th>
              <th style={styles.th}>Correctas</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Precisión</th>
              <th style={styles.th}>Duración</th>
              <th style={styles.th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.session_id}>
                <td style={styles.td}>{s.session_id}</td>
                <td style={styles.td}>{s.tonality}</td>
                <td style={styles.td}>{s.correct}</td>
                <td style={styles.td}>{s.total}</td>
                <td style={styles.td}>{s.accuracy}%</td>
                <td style={styles.td}>{s.duration}s</td>
                <td style={styles.td}>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem' },
  title: { color: '#fff', marginBottom: '1rem' },
  search: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  input: { padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid #333', background: '#0f0f0f', color: '#fff', fontSize: '0.875rem', width: '240px' },
  button: { padding: '0.6rem 1.5rem', borderRadius: '4px', border: 'none', background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.875rem' },
  error: { color: '#ff4444' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #333', color: '#aaa', fontSize: '0.875rem' },
  td: { padding: '0.75rem', borderBottom: '1px solid #1a1a1a', color: '#fff', fontSize: '0.875rem' },
};