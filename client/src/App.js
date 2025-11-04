import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PostView from './components/PostView';
import NewPost from './components/NewPost';
import EditPost from './components/EditPost';
import { api } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getCurrentUser()
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navigation user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLogin} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" /> : <Register />} 
        />
        <Route path="/post/:id" element={<PostView user={user} />} />
        <Route 
          path="/new" 
          element={user ? <NewPost user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/edit/:id" 
          element={user ? <EditPost user={user} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
