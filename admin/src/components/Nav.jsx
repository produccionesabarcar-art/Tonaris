import { Link, useNavigate } from 'react-router-dom';

export default function Nav() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('tonaris_user') || '{}');

  function logout() {
    localStorage.removeItem('tonaris_token');
    localStorage.removeItem('tonaris_user');
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>Tonaris Admin</span>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Usuarios</Link>
        <Link to="/sessions" style={styles.link}>Sesiones</Link>
        <Link to="/progress" style={styles.link}>Progreso</Link>
      </div>
      <div style={styles.user}>
        <span style={styles.userName}>{user.name}</span>
        <button style={styles.logout} onClick={logout}>Salir</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #1a1a1a', gap: '2rem' },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: '1rem' },
  links: { display: 'flex', gap: '1.5rem', flex: 1 },
  link: { color: '#aaa', textDecoration: 'none', fontSize: '0.875rem' },
  user: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { color: '#aaa', fontSize: '0.875rem' },
  logout: { padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid #333', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.875rem' },
};
