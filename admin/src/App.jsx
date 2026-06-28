import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Users from './pages/Users';
import Sessions from './pages/Sessions';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';

function Nav() {
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
        <Link to="/analytics" style={styles.link}>Analítica</Link>
      </div>
      <div style={styles.user}>
        <span style={styles.userName}>{user.name}</span>
        <button style={styles.logout} onClick={logout}>Salir</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <Nav />
              <main>
                <Routes>
                  <Route path="/" element={<Users />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#0f0f0f' },
  nav: { display: 'flex', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #1a1a1a', gap: '2rem' },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: '1rem' },
  links: { display: 'flex', gap: '1.5rem', flex: 1 },
  link: { color: '#aaa', textDecoration: 'none', fontSize: '0.875rem' },
  user: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { color: '#aaa', fontSize: '0.875rem' },
  logout: { padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid #333', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.875rem' },
};