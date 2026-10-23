const API_BASE = '/api';

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const raw = localStorage.getItem('qc_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.role) headers['x-user-role'] = user.role;
    }
    const token = localStorage.getItem('qc_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {}
  return headers;
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Authentication failed');
  }
  return res.json();
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to verify session');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchPatients(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/patients${query ? `?${query}` : ''}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function fetchPatientById(id) {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch patient');
  return res.json();
}

export async function registerPatient(patientData) {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(patientData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to register patient');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function recordVitals(vitalsData) {
  const res = await fetch(`${API_BASE}/vitals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(vitalsData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to record vitals');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchDoctorQueue() {
  const res = await fetch(`${API_BASE}/rounds/queue`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch doctor round queue');
  return res.json();
}

export async function logDoctorRound(roundData) {
  const res = await fetch(`${API_BASE}/rounds`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(roundData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to log doctor round');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function recommendDischarge(data) {
  const res = await fetch(`${API_BASE}/discharge/recommend`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to recommend discharge');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchDischargeQueue() {
  const res = await fetch(`${API_BASE}/discharge/queue`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch discharge queue');
  return res.json();
}

export async function updateDischargeSignoff(data) {
  const res = await fetch(`${API_BASE}/discharge/signoff`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update signoff');
  return res.json();
}

export async function releaseBed(data) {
  const res = await fetch(`${API_BASE}/discharge/release`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to release bed');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchOutcomes() {
  const res = await fetch(`${API_BASE}/outcomes`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch outcomes');
  return res.json();
}

export async function fetchAuditLog(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/audit${query ? `?${query}` : ''}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
}

export async function verifyAuditLedger() {
  const res = await fetch(`${API_BASE}/audit/verify`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to verify audit ledger');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settingsData) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to update settings');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// User Management (Admin Only)
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to fetch user directory');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to create user account');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${API_BASE}/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to update user role');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function updateUserStatus(userId, active) {
  const res = await fetch(`${API_BASE}/users/${userId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ active })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Failed to update user status');
    error.code = err.code;
    error.status = res.status;
    throw error;
  }
  return res.json();
}
