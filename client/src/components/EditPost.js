import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await api.getPost(id);
      if (!data.isAuthor) {
        alert('You can only edit your own posts');
        navigate(`/post/${id}`);
        return;
      }
      setPost(data.post);
      setTitle(data.post.title);
      setContent(data.post.content);
    } catch (err) {
      console.error('Failed to load post:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.updatePost(id, title, content);
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
            <Link to={`/post/${id}`} className="btn btn-outline-secondary">
              Back to Post
            </Link>
          </div>

          <div className="form-container">
            <h1 className="mb-4">Edit Post</h1>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="content" className="form-label">
                  Content <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  rows="10"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{minHeight: '200px', resize: 'vertical'}}
                ></textarea>
                <div className="form-text">
                  Update your post content
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <button 
                    type="button" 
                    onClick={handleDelete} 
                    className="btn btn-danger"
                  >
                    Delete Post
                  </button>
                </div>
                
                <div className="d-flex gap-2">
                  <Link 
                    to={`/post/${id}`} 
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPost;