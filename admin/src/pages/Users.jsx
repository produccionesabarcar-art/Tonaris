import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/users/all')
      .then(setUsers)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Usuarios</h2>
      {error && <p style={styles.error}>{error}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Rol</th>
            <th style={styles.th}>Creado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id}>
              <td style={styles.td}>{u.user_id}</td>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>{u.role}</td>
              <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
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