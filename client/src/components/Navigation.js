import React from 'react';
import { Link } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Project Blog
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-auto">
            {user ? (
              <>
                <Link className="nav-link" to="/">Home</Link>
                <Link className="nav-link" to="/new">New Post</Link>
                <span className="nav-link">
                  Welcome, <strong>{user.username}</strong>
                </span>
                <button 
                  className="nav-link btn btn-link" 
                  onClick={onLogout}
                  style={{textDecoration: 'none'}}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/">Home</Link>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
