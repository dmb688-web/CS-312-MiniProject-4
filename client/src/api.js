const API_BASE = '/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  },

  async register(username, email, password, confirmPassword) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, confirmPassword })
    });
  },

  async login(username, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async logout() {
    return this.request('/logout', { method: 'POST' });
  },

  async getCurrentUser() {
    return this.request('/user');
  },

  async getPosts() {
    return this.request('/posts');
  },

  async getPost(id) {
    return this.request(`/posts/${id}`);
  },

  async createPost(title, content) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
  },

  async updatePost(id, title, content) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content })
    });
  },

  async deletePost(id) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE'
    });
  }
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
