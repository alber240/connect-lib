import axios from 'axios';

// Replace with your Render backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://connect-lib.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ INSTITUTIONS ============

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

// ============ COUNTIES ============

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

// ============ NEWS ============

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

// User Registration
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

// User Login (uses JWT)
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

// User Logout
export const userLogout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_refresh');
  localStorage.removeItem('user_username');
};

// Check if user is logged in
export const isUserLoggedIn = () => {
  return !!localStorage.getItem('user_token');
};

// Get current logged in user
export const getCurrentUser = () => {
  return localStorage.getItem('user_username');
};

// ============ SUGGESTIONS ============

// Submit a suggestion
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