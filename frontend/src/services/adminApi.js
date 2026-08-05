const API_BASE_URL = 'http://localhost:8080/api/admin';

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

function getHeaders(token) {
  const currentToken = localStorage.getItem('authToken') || token;
  if (!currentToken) {
    throw new Error('Authentication token is missing. Access denied.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentToken}`,
  };
}

export async function addProduct(token, productData) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
}

export async function deleteProduct(token, productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function updateProduct(token, productId, productData) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
}

export async function fetchAllUsers(token) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function updateUser(token, userId, userData) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function deleteUser(token, userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function fetchDailyAnalytics(token, date) {
  const response = await fetch(`${API_BASE_URL}/analytics/daily?date=${date}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function fetchMonthlyAnalytics(token, year, month) {
  const response = await fetch(`${API_BASE_URL}/analytics/monthly?year=${year}&month=${month}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function fetchYearlyAnalytics(token, year) {
  const response = await fetch(`${API_BASE_URL}/analytics/yearly?year=${year}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function fetchOverallAnalytics(token) {
  const response = await fetch(`${API_BASE_URL}/analytics/overall`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}
