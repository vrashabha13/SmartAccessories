const API_BASE_URL = 'http://localhost:8080';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return data;
}

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCart(token) {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function fetchCartCount(token) {
  const response = await fetch(`${API_BASE_URL}/cart/count`, {
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function addToCart(token, productId, quantity = 1) {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  });
  return handleResponse(response);
}

export async function updateCartItem(token, cartItemId, quantity) {
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(response);
}

export async function removeFromCart(token, cartItemId) {
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function createOrder(token) {
  const response = await fetch(`${API_BASE_URL}/orders/create`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function verifyPayment(token, payload) {
  const response = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
