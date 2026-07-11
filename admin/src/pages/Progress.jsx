import { useState } from 'react';
import { apiFetch } from '../api/client';

export default function Progress() {
  const [progress, setProgress] = useState(null);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setProgress(null);
    try {
      const data = await apiFetch(`/progress/${userId}`);
      setProgress(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Progreso</h2>
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
      {progress && (
        <div style={styles.grid}>
          <Stat label="Sesiones totales" value={progress.totalSessions} />
          <Stat label="Precisión promedio" value={`${progress.avgAccuracy}%`} />
          <Stat label="Mejor precisión" value={`${progress.bestAccuracy}%`} />
          <Stat label="Respuestas correctas" value={progress.totalCorrect} />
          <Stat label="Preguntas totales" value={progress.totalQuestions} />
          <Stat label="Última sesión" value={new Date(progress.lastSession).toLocaleDateString()} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.label}>{label}</p>
      <p style={styles.value}>{value}</p>
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  card: { background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' },
  label: { color: '#aaa', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' },
  value: { color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 },
};