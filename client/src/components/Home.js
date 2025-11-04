import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../api';

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data.posts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hero-section">
        <div className="container text-center">
          <h1 className="display-4 mb-3">Welcome to Project Blog</h1>
          <p className="lead">Share your thoughts and ideas</p>
          {user ? (
            <Link to="/new" className="btn btn-light btn-lg mt-3">
              Write New Post
            </Link>
          ) : (
            <Link to="/login" className="btn btn-light btn-lg mt-3">
              Login to Write Posts
            </Link>
          )}
        </div>
      </div>

      <div className="container">
        {posts.length === 0 ? (
          <div className="text-center py-5">
            <h3>No posts yet</h3>
            <p className="text-muted">Be the first to share something!</p>
            {user && (
              <Link to="/new" className="btn btn-primary">
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="row">
            {posts.map(post => (
              <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card post-card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                      <Link 
                        to={`/post/${post.id}`} 
                        className="text-decoration-none"
                      >
                        {post.title}
                      </Link>
                    </h5>
                    <p className="card-text flex-grow-1">
                      {post.content.length > 150 
                        ? post.content.substring(0, 150) + '...' 
                        : post.content}
                    </p>
                    <div className="post-meta">
                      <small>
                        by {post.username}
                        <br />
                        {formatDate(post.created_at)}
                      </small>
                    </div>
                    <div className="mt-3">
                      <Link 
                        to={`/post/${post.id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        Read More
                      </Link>
                      {user && user.id === post.author_id && (
                        <Link 
                          to={`/edit/${post.id}`} 
                          className="btn btn-outline-secondary btn-sm ms-2"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
