import axios from 'axios';

// Replace with your Render backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://connect-lib.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
  // Remove default Content-Type header - let axios handle it
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type globally - let it be set per request
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
export const getInstitutions = async () => {
  const response = await api.get('/dashboard/institutions/');
  return response.data;
};

export const getInstitution = async (id) => {
  const response = await api.get(`/dashboard/institutions/${id}/`);
  return response.data;
};

export const createInstitution = async (data) => {
  try {
    // If data is FormData, let axios set the Content-Type automatically
    const response = await api.post('/dashboard/institutions/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating institution:', error);
    throw error;
  }
};

export const updateInstitution = async (id, data) => {
  try {
    const response = await api.put(`/dashboard/institutions/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating institution:', error);
    throw error;
  }
};

export const deleteInstitution = async (id) => {
  await api.delete(`/dashboard/institutions/${id}/`);
};

// ============ SUGGESTIONS ============
export const getSuggestions = async (status = null) => {
  const url = status ? `/dashboard/suggestions/?status=${status}` : '/dashboard/suggestions/';
  const response = await api.get(url);
  return response.data;
};

export const approveSuggestion = async (id, notes = '') => {
  const response = await api.post(`/dashboard/suggestions/${id}/action/`, {
    action: 'approve',
    notes,
  });
  return response.data;
};

export const rejectSuggestion = async (id, notes = '') => {
  const response = await api.post(`/dashboard/suggestions/${id}/action/`, {
    action: 'reject',
    notes,
  });
  return response.data;
};

export const deleteSuggestion = async (id) => {
  try {
    const response = await api.delete(`/dashboard/suggestions/${id}/delete/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    throw error;
  }
};

// ============ NEWS ============
export const getNews = async () => {
  const response = await api.get('/dashboard/news/');
  return response.data;
};

export const createNews = async (data) => {
  let config = {};
  if (data instanceof FormData) {
    config.headers = { 'Content-Type': 'multipart/form-data' };
  }
  const response = await api.post('/dashboard/news/', data, config);
  return response.data;
};

export const updateNews = async (id, data) => {
  try {
    let config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      config.headers = { 'Content-Type': 'application/json' };
      data = JSON.stringify(data);
    }
    const response = await api.put(`/dashboard/news/${id}/`, data, config);
    return response.data;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

export const deleteNews = async (id) => {
  await api.delete(`/dashboard/news/${id}/`);
};

export default api;