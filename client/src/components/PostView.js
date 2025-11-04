import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, formatDate } from '../api';

function PostView({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await api.getPost(id);
      setPost(data.post);
      setIsAuthor(data.isAuthor);
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.deletePost(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete post: ' + err.message);
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

  if (!post) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">Post not found</div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-3">
            <Link to="/" className="btn btn-outline-secondary">
              Back Home
            </Link>
          </div>

          <article className="bg-white">
            <h1 className="display-5 mb-4">{post.title}</h1>
            
            <div 
              className="post-meta pb-3 mb-4" 
              style={{borderBottom: '1px solid #0F5132'}}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>by {post.username}</strong>
                </div>
                <div className="text-end">
                  <div>Published: {formatDate(post.created_at)}</div>
                  {post.updated_at && 
                   new Date(post.updated_at).getTime() !== new Date(post.created_at).getTime() && (
                    <div className="text-muted small">
                      Last updated: {formatDate(post.updated_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
            </div>

            {isAuthor && (
              <div className="d-flex gap-2 mt-4 pt-4 border-top">
                <Link 
                  to={`/edit/${post.id}`} 
                  className="btn btn-warning"
                >
                  Edit Post
                </Link>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-danger"
                >
                  Delete Post
                </button>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

export default PostView;