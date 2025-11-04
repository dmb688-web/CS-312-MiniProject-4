import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function NewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.createPost(title, content);
      navigate(`/post/${data.post.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-3">
            <Link to="/" className="btn btn-outline-secondary">
              Back Home
            </Link>
          </div>

          <div className="form-container">
            <h1 className="mb-4">Create New Post</h1>

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
                  Share your thoughts and ideas
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Link to="/" className="btn btn-outline-secondary me-md-2">
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPost;
