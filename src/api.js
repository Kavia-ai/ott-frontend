const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((item) => item.msg).join(' ')
      : 'Unable to complete the request.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

export const ottApi = {
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (payload) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getPlans: () => request('/plans'),
  getMe: (token) => request('/me', { token }),
  checkout: (token, payload) => request('/subscriptions/checkout', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  }),
};
