const API_BASE_URL = 'http://localhost:8000/api/accounts';

export const authAPI = {
  async signup(data) {
    const res = await fetch(`${API_BASE_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  async login(data) {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  async googleLogin(idToken) {
    const res = await fetch(`${API_BASE_URL}/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_token: idToken }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  async logout(token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Logout failed');
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE_URL}/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async refreshToken() {
    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  }
};
