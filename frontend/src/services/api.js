import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shelflife_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('shelflife_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const booksAPI = {
  getBooks: async () => {
    const response = await api.get('/books');
    return response.data;
  },
  searchBooks: async (query) => {
    const response = await api.get('/books/search', {
      params: { q: query },
    });
    return response.data;
  },
  addBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  updateBook: async (id, updateData) => {
    const response = await api.put(`/books/${id}`, updateData);
    return response.data;
  },
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
};

export default api;
