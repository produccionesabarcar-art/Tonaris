import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin() {
    setError('');
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      if (data.user.role !== 'admin') throw new Error('Acceso solo para administradores.');

      localStorage.setItem('tonaris_token', data.token);
      localStorage.setItem('tonaris_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Tonaris Admin</h1>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin}>Ingresar</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' },
  card: { background: '#1a1a1a', padding: '2rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' },
  title: { color: '#fff', margin: 0, textAlign: 'center', fontSize: '1.5rem' },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#0f0f0f', color: '#fff', fontSize: '1rem' },
  button: { padding: '0.75rem', borderRadius: '4px', border: 'none', background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
  error: { color: '#ff4444', margin: 0, fontSize: '0.875rem' },
};