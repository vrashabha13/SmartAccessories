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

export async function fetchOrderHistory(token) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}
