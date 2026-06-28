import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Users from './pages/Users';
import Sessions from './pages/Sessions';
import Progress from './pages/Progress';

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Users />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="progress" element={<Progress />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#0f0f0f' },
};
