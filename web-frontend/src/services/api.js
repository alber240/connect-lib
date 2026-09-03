import axios from 'axios';

// Use environment variable or fallback to production URL
// Force the correct API URL for Render
const API_BASE_URL = 'https://connect-lib.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (e) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token/`, {
      username,
      password,
    });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    }
    throw new Error('No access token received');
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Login failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// ============ DASHBOARD ============
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats/');
  return response.data;
};

// ============ INSTITUTIONS ============
export const getInstitutions = async (params = {}) => {
  try {
    const response = await api.get('/institutions/', { params });
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return [];
  }
};

export const getInstitution = async (id) => {
  try {
    const response = await api.get(`/institutions/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching institution:', error);
    return null;
  }
};

// ============ COUNTIES ============
export const getCounties = async () => {
  try {
    const response = await api.get('/counties/');
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching counties:', error);
    return [];
  }
};

// ============ NEWS ============
export const getNews = async () => {
  try {
    const response = await api.get('/news/');
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getLatestNews = async (limit = 4) => {
  try {
    const response = await api.get(`/news/?limit=${limit}`);
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};

// ============ USER AUTHENTICATION ============
export const register = async (username, email, password, password2) => {
  try {
    const response = await api.post('/register/', {
      username,
      email,
      password,
      password2,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

export const userLogin = async (username, password) => {
  try {
    const response = await api.post('/token/', {
      username,
      password,
    });
    if (response.data.access) {
      localStorage.setItem('user_token', response.data.access);
      localStorage.setItem('user_refresh', response.data.refresh);
      localStorage.setItem('user_username', username);
      return response.data;
    }
    throw new Error('No access token received');
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};

export const userLogout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_refresh');
  localStorage.removeItem('user_username');
};

export const isUserLoggedIn = () => {
  return !!localStorage.getItem('user_token');
};

export const getCurrentUser = () => {
  return localStorage.getItem('user_username');
};

// ============ SUGGESTIONS ============
export const submitSuggestion = async (suggestionData) => {
  try {
    const response = await api.post('/suggestions/', suggestionData);
    return response.data;
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    throw error.response?.data || { error: 'Failed to submit suggestion' };
  }
};

export default api;