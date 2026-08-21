import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all institutions (with optional search/filters)
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

// Get a single institution by ID
export const getInstitution = async (id) => {
  try {
    const response = await api.get(`/institutions/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching institution:', error);
    return null;
  }
};

// Get all counties
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

// Add to existing api.js

// Get all news
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

// Get latest news (for homepage)
export const getLatestNews = async (limit = 3) => {
  try {
    const response = await api.get('/news/?limit=' + limit);
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};

// Add these to api.js

// User Registration
export const register = async (username, email, password, password2) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, {
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

// User Login (uses JWT)
export const userLogin = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token/`, {
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

export default api;

