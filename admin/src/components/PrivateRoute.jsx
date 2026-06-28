import { Navigate, Outlet } from 'react-router-dom';
import Nav from './Nav';

export default function PrivateRoute() {
  const token = localStorage.getItem('tonaris_token');

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('tonaris_token');
      localStorage.removeItem('tonaris_user');
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem('tonaris_token');
    localStorage.removeItem('tonaris_user');
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Nav />
      <main style={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

const styles = {
  main: { padding: '0' },
};
