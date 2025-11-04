const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'blog_db'
});

// Test database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to PostgreSQL:', err);
  } else {
    console.log('Successfully connected to PostgreSQL');
    release();
  }
});

// Initialize database tables
async function initializeDB() {
  try {
    const client = await pool.connect();
    
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✓ Database tables initialized successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('⚠ Error initializing database:', err.message);
    console.log('⚠ Continuing anyway - database may already exist');
  }
}

initializeDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple session storage (in production, use redis or database)
const sessions = new Map();

// Session middleware
const sessionMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && sessions.has(token)) {
    req.user = sessions.get(token);
  }
  next();
};

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

app.use(sessionMiddleware);

// ==== AUTH API ROUTES ====

// Register user
app.post('/api/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create session token
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    sessions.set(token, { id: user.id, username: user.username });

    res.json({ 
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ==== BLOG API ROUTES ====

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json({ posts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// Get a single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];
    const isAuthor = req.user && req.user.id === post.author_id;
    res.json({ post, isAuthor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error loading post' });
  }
});

// Create a new post
app.post('/api/posts', requireAuth, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), content.trim(), req.user.id]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update a post
app.put('/api/posts/:id', requireAuth, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const checkResult = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = checkResult.rows[0];

    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title.trim(), content.trim(), req.params.id]
    );

    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];

    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Serve React app static files (after building)
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all handler for React routing (must be last)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Blog server running on http://localhost:${PORT}`);
});

module.exports = app;