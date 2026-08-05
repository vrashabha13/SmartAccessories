const API_BASE_URL = 'http://localhost:8080';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }

  return data;
}

export async function register(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
}

export async function logout(token) {
  const currentToken = localStorage.getItem('authToken') || token;
  if (!currentToken) return;
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`,
    },
  });

  return handleResponse(response);
}

export async function fetchProfile(token) {
  const currentToken = localStorage.getItem('authToken') || token;
  if (!currentToken) {
    throw new Error('Authentication token is missing. Access denied.');
  }
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  return handleResponse(response);
}
