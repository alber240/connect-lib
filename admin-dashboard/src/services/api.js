import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
export const getInstitutions = async () => {
  const response = await api.get('/dashboard/institutions/');
  return response.data;
};

export const getInstitution = async (id) => {
  const response = await api.get(`/dashboard/institutions/${id}/`);
  return response.data;
};

export const createInstitution = async (data) => {
  const response = await api.post('/dashboard/institutions/', data);
  return response.data;
};

export const updateInstitution = async (id, data) => {
  const response = await api.put(`/dashboard/institutions/${id}/`, data);
  return response.data;
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
    // If you have a dedicated delete endpoint, use it
    // Otherwise, we'll use the suggestions endpoint with delete
    const response = await api.delete(`/suggestions/${id}/`);
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
  const response = await api.post('/dashboard/news/', data);
  return response.data;
};

export const updateNews = async (id, data) => {
  try {
    // If data is FormData, use multipart
    // Otherwise send as JSON
    let config = {};
    let requestData = data;
    
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      config.headers = { 'Content-Type': 'application/json' };
      requestData = JSON.stringify(data);
    }
    
    const response = await api.put(`/dashboard/news/${id}/`, requestData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

export const deleteNews = async (id) => {
  await api.delete(`/dashboard/news/${id}/`);
};