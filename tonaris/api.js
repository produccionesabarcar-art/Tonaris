/* ============================================================
   TONARIS — api.js
   Cliente HTTP hacia la API de AbarcarTonaris
   ============================================================ */

const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? 'http://localhost:3000'  // <--- Asegúrate de que diga localhost aquí
  : 'https://tonaris.onrender.com';

function getToken() {
  return localStorage.getItem('tonaris_token');
}

function getHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function apiPost(path, body) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.warn('Tonaris API error:', e.message);
    return null;
  }
}

async function apiGet(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: getHeaders()
    });
    return await res.json();
  } catch (e) {
    console.warn('Tonaris API error:', e.message);
    return null;
  }
}

async function apiPatch(path, body) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.warn('Tonaris API error:', e.message);
    return null;
  }
}

/* --- Auth --- */
async function apiLogin(email, password) {
  const data = await apiPost('/api/users/login', { email, password });
  if (data?.token) {
    localStorage.setItem('tonaris_token', data.token);
    localStorage.setItem('tonaris_api_user', JSON.stringify(data.user));
  }
  return data;
}

async function apiRegister(user_id, name, email, password, institution) {
  return await apiPost('/api/users/register', {
    user_id, name, email, password, institution, role: 'estudiante'
  });
}

/* --- Sesiones --- */
async function apiSaveSession(session) {
  return await apiPost('/api/sessions', session);
}

/* --- Analytics --- */
async function apiGetLeaderboard() {
  return await apiGet('/api/analytics/leaderboard');
}

async function apiGetSummary(userId) {
  return await apiGet(`/api/analytics/summary/${userId}`);
}

async function apiSetAlias(userId, alias) {
  return await apiPatch(`/api/users/${userId}/alias`, { alias });
}

/* --- Password Reset --- */
async function apiForgotPassword(email) {
  const res = await fetch(`${API_URL}/api/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await res.json();
}

async function apiResetPassword(token, newPassword) {
  const res = await fetch(`${API_URL}/api/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return await res.json();
}

/* --- Helpers --- */
function apiLogout() {
  localStorage.removeItem('tonaris_token');
  localStorage.removeItem('tonaris_api_user');
}

function apiGetCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('tonaris_api_user'));
  } catch { return null; }
}

window.api = { apiForgotPassword, apiResetPassword };