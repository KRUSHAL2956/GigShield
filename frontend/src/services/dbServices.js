import api from '../api/axios';

// ─── Firebase Auth → Backend ────────────────────────────
// Sends Firebase ID token to backend. Backend verifies & checks PostgreSQL.
// Returns { rider, token } or { needsRegistration, firebaseData }
export async function authenticateWithFirebase(idToken) {
  const res = await api.post('/api/riders/auth/firebase', { idToken });
  return res.data;
}

// ─── Registration (Step 1+2 combined into backend) ──────
export async function registerRider(data) {
  const res = await api.post('/api/riders/register', data);
  return res.data;
}

// ─── Get current user profile ───────────────────────────
export async function getCurrentUser() {
  const res = await api.get('/api/riders/me');
  return res.data;
}
