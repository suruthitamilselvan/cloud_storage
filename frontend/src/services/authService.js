import apiClient from './apiClient';

const MOCK_USER = {
  token: 'demo_jwt_token_cloudvault',
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'suruthi@cloudvault.com',
  fullName: 'Suruthi Tamilslevan',
  role: 'ROLE_USER',
  storageUsed: 4509715660, // 4.2 GB
  storageLimit: 16106127360, // 15 GB
};

const parseGoogleJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const authService = {
  login: async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
      }
      return res.data;
    } catch (err) {
      localStorage.setItem('jwt_token', MOCK_USER.token);
      localStorage.setItem('user_info', JSON.stringify(MOCK_USER));
      return { ...MOCK_USER, email: email || MOCK_USER.email };
    }
  },

  googleLogin: async (email = 'suruthitamilselvan10@gmail.com', fullName = 'Suruthi Tamilselvan') => {
    try {
      const res = await apiClient.post('/auth/google', { email, fullName });
      if (res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
      }
      return res.data;
    } catch (err) {
      const googleUser = {
        token: 'demo_google_jwt_token_' + Date.now(),
        id: 'google-uid-' + Date.now(),
        email: email,
        fullName: fullName || email.split('@')[0],
        role: 'ROLE_USER',
        storageLimit: 16106127360,
      };
      localStorage.setItem('jwt_token', googleUser.token);
      localStorage.setItem('user_info', JSON.stringify(googleUser));
      return googleUser;
    }
  },

  googleOAuthLogin: async (credential) => {
    try {
      const res = await apiClient.post('/auth/google', { idToken: credential });
      if (res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
      }
      return res.data;
    } catch (err) {
      const payload = parseGoogleJwt(credential);
      const googleUser = {
        token: credential,
        id: payload?.sub || 'google-uid-' + Date.now(),
        email: payload?.email || 'user@gmail.com',
        fullName: payload?.name || payload?.email?.split('@')[0] || 'Google User',
        avatarUrl: payload?.picture || '',
        role: 'ROLE_USER',
        storageLimit: 16106127360,
      };
      localStorage.setItem('jwt_token', googleUser.token);
      localStorage.setItem('user_info', JSON.stringify(googleUser));
      return googleUser;
    }
  },

  register: async (fullName, email, password) => {
    try {
      const res = await apiClient.post('/auth/register', { fullName, email, password });
      if (res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
      }
      return res.data;
    } catch (err) {
      const newUser = { ...MOCK_USER, fullName: fullName || 'Suruthi Tamilslevan', email: email || MOCK_USER.email };
      localStorage.setItem('jwt_token', newUser.token);
      localStorage.setItem('user_info', JSON.stringify(newUser));
      return newUser;
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (err) {
      const stored = localStorage.getItem('user_info');
      if (stored) return JSON.parse(stored);
      return MOCK_USER;
    }
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  }
};
