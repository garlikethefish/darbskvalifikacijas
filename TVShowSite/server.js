import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'plottwizts'
});

// Change quote on refresh
app.get('/api/daily-quote', (req, res) => {
  db.query('SELECT * FROM quotes ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err || results.length === 0) return res.status(500).send(err);
    res.json(results[0]);
  });
});



// Register
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  const role = 'user'; // force default role assignment

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [username, email, hashedPassword, 'user'], (err, result) => {
    if (err) {
      console.error('MySQL Error:', err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || 'Registration failed' });
    }

    res.status(200).json({ message: 'User registered successfully' });
  });
});


// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});



// Get all reviews 
app.get('/api/reviews', (req, res) => {
  const { episodeId, userId } = req.query;

  let query = `
    SELECT r.*,
           u.username, u.profile_picture, 
           e.title AS episode_title, e.season_number, e.episode_number, e.picture AS episode_picture,
           s.title AS series_title,
           (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS user_review_count,
           (SELECT AVG(r2.rating) FROM reviews r2 WHERE r2.episode_id = r.episode_id) AS average_rating
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN episodes e ON r.episode_id = e.id
    JOIN series s ON e.series_id = s.id
  `;

  const params = [];

  if (episodeId) {
    query += ' WHERE r.episode_id = ?';
    params.push(episodeId);
  }
  else if (userId) {
    query += ' WHERE r.user_id = ?';
    params.push(userId);
  }
  db.query(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    res.json(rows);
  });
});

app.get('/api/episodes', (req, res) => {
  const { seriesId } = req.query;

  if (!seriesId) {
    return res.status(400).json({ error: 'Missing seriesId query parameter' });
  }

  const query = `
    SELECT id, title, season_number, episode_number, picture
    FROM episodes
    WHERE series_id = ?
    ORDER BY season_number, episode_number
  `;

  db.query(query, [seriesId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch episodes' });
    }

    res.json(results);
  });
});

// Get all series
app.get('/api/series', (req, res) => {
  const query = `
    SELECT id, title, description, genre, release_year, series_picture
    FROM series
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch series' });
    }

    res.json(rows);
  });
});

// add new review
app.post('/api/reviews', (req, res) => {
  const { user_id, episode_id, rating, review_text, review_title } = req.body;

  if (!user_id || !episode_id || !rating || !review_text || !review_title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO reviews 
      (user_id, episode_id, rating, review_text, review_title, date, likes, dislikes, comment_count)
    VALUES (?, ?, ?, ?, ?, NOW(), 0, 0, 0)
  `;

  db.query(
    query,
    [user_id, episode_id, rating, review_text, review_title],
    (err, result) => {
      if (err) {
        console.error('Database error:', err.sqlMessage); // SHOW THE SQL ERROR
        return res.status(500).json({ error: err.sqlMessage }); // RETURN IT IN RESPONSE
      }

      res.status(201).json({ message: 'Review created', reviewId: result.insertId });
    }
  );
});




db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
