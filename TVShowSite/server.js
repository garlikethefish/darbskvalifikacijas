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

function getConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'plottwizts'
  });
}
function requireAuth(req, res, next) {
  const userId = req.headers.authorization; 

  if (!userId || isNaN(userId)) {
    return res.status(401).json({ message: 'Login required' });
  }

  req.userId = parseInt(userId); 
  next();
}




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

// Updated /api/series endpoint with filtering support
app.get('/api/series', (req, res) => {
  const { genre, year, sort } = req.query;
  
  let query = `
    SELECT id, title, description, genre, release_year, series_picture
    FROM series
  `;
  
  const params = [];
  const whereClauses = [];
  
  // Genre filtering
  if (genre) {
    const genres = genre.split(',').map(g => g.trim().toLowerCase());
    whereClauses.push(`LOWER(genre) LIKE ?`);
    params.push(`%${genres[0]}%`); // Simple implementation for single genre
  }
  
  // Year filtering
  if (year) {
    const years = year.split(',').map(y => parseInt(y.trim()));
    whereClauses.push(`release_year IN (?)`);
    params.push(years);
  }
  
  // Combine WHERE clauses
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  
  // Sorting
  if (sort) {
    switch(sort) {
      case 'title-asc':
        query += ` ORDER BY title ASC`;
        break;
      case 'title-desc':
        query += ` ORDER BY title DESC`;
        break;
      case 'year-asc':
        query += ` ORDER BY release_year ASC`;
        break;
      case 'year-desc':
        query += ` ORDER BY release_year DESC`;
        break;
      // No default - random sorting should be done client-side
    }
  }
  
  db.query(query, params, (err, rows) => {
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

app.post('/api/reviews/:id/react', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { is_like } = req.body;
  const userId = req.userId;

  const isLikeInt = is_like ? 1 : 0;

  console.log('Review ID:', id);
  console.log('User ID:', userId);
  console.log('Reaction:', is_like);

  try {
    // Check if review exists
    const [reviewRows] = await db.promise().query(
      'SELECT * FROM reviews WHERE id = ?',
      [id]
    );
    if (reviewRows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user already reacted
    const [existingReaction] = await db.promise().query(
      'SELECT is_like FROM review_reactions WHERE user_id = ? AND review_id = ?',
      [userId, id]
    );

    console.log('Existing Reaction:', existingReaction);
    console.log('Just made reaction:', isLikeInt);

    if (!Array.isArray(existingReaction)) {
      return res.status(500).json({ message: 'Unexpected reaction data format' });
    }

    if (existingReaction.length > 0) {
      if (existingReaction[0].is_like === isLikeInt) {
        // Same reaction: remove it
        await db.promise().query(
          'DELETE FROM review_reactions WHERE user_id = ? AND review_id = ?',
          [userId, id]
        );
        console.log('Reaction removed');
      } else {
        // Different reaction: update it
        await db.promise().query(
          'UPDATE review_reactions SET is_like = ? WHERE user_id = ? AND review_id = ?',
          [is_like, userId, id]
        );
        console.log('Reaction updated');
      }
    } else {
      // No prior reaction: insert it
      await db.promise().query(
        'INSERT INTO review_reactions (user_id, review_id, is_like) VALUES (?, ?, ?)',
        [userId, id, is_like]
      );
      console.log('Reaction inserted');
    }

    // Recalculate like/dislike counts
    const [counts] = await db.promise().query(
      `SELECT 
        SUM(is_like = 1) AS likes, 
        SUM(is_like = 0) AS dislikes
      FROM review_reactions
      WHERE review_id = ?`,
      [id]
    );

    // Update the reviews table with new counts
    await db.promise().query(
      'UPDATE reviews SET likes = ?, dislikes = ? WHERE id = ?',
      [counts[0].likes || 0, counts[0].dislikes || 0, id]
    );

    res.json({
      message: 'Reaction processed',
      likes: counts[0].likes || 0,
      dislikes: counts[0].dislikes || 0
    });

  } catch (err) {
    console.error('Error processing reaction:', err);
    res.status(500).json({ message: 'Failed to process reaction' });
  }
});




app.post('/api/reviews/:id/comments', requireAuth, (req, res) => {
  const { id } = req.params;
  const { comment_text, episode_id, other_user_id } = req.body;
  const userId = req.userId;

  if (!comment_text || comment_text.trim().length === 0) {
    return res.status(400).json({ message: 'Empty comment not allowed' });
  }

  const conn = getConnection();

  conn.query(
    `INSERT INTO comments (user_id, review_id, episode_id, comment_text, other_user_id) VALUES (?, ?, ?, ?, ?)`,
    [userId, id, episode_id || 0, comment_text, other_user_id || null],
    (err) => {
      if (err) {
        console.error('Insert comment error:', err);
        conn.end();
        return res.status(500).json({ message: 'Failed to add comment' });
      }

      conn.query(
        `UPDATE reviews SET comment_count = comment_count + 1 WHERE id = ?`,
        [id],
        (err2) => {
          conn.end();
          if (err2) return res.status(500).json({ message: 'Failed to update comment count' });
          res.json({ message: 'Comment added' });
        }
      );
    }
  );
});

app.get('/api/reviews/:id/comments', (req, res) => {
  const { id } = req.params;
  const conn = getConnection();

  conn.query(
    `SELECT c.id, c.comment_text, c.created_at, c.other_user_id, u.username, u.profile_picture, u.role
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.review_id = ?
     ORDER BY c.created_at ASC`,
    [id],
    (err, results) => {
      conn.end();
      if (err) {
        console.error('Fetch comments error:', err);
        return res.status(500).json({ message: 'Failed to load comments' });
      }
      res.json(results);
    }
  );
});
// Delete review 
app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Get the review first to check ownership
    const [reviewRows] = await db.promise().query(
      'SELECT user_id FROM reviews WHERE id = ?',
      [id]
    );

    if (reviewRows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Get user role
    const [userRows] = await db.promise().query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(403).json({ message: 'User not found' });
    }

    const userRole = userRows[0].role;
    const isOwner = reviewRows[0].user_id === userId;
    const isAdmin = userRole === 'admin';

    // Check permissions
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Delete the review
    await db.promise().query('DELETE FROM reviews WHERE id = ?', [id]);
    
    // Clean up related data
    await db.promise().query('DELETE FROM review_reactions WHERE review_id = ?', [id]);
    await db.promise().query('DELETE FROM comments WHERE review_id = ?', [id]);

    res.json({ message: 'Review deleted successfully' });

  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Delete comment
app.delete('/api/comments/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Get the comment first to check ownership
    const [commentRows] = await db.promise().query(
      'SELECT user_id, review_id FROM comments WHERE id = ?',
      [id]
    );

    if (commentRows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Get user role
    const [userRows] = await db.promise().query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(403).json({ message: 'User not found' });
    }

    const userRole = userRows[0].role;
    const isOwner = commentRows[0].user_id === userId;
    const isAdmin = userRole === 'admin';

    // Check permissions
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await db.promise().query('DELETE FROM comments WHERE id = ?', [id]);
    
    // Update comment count in the review
    await db.promise().query(
      'UPDATE reviews SET comment_count = comment_count - 1 WHERE id = ?',
      [commentRows[0].review_id]
    );

    res.json({ message: 'Comment deleted successfully' });

  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});
// Update username
app.put('/api/users/:id/username', requireAuth, async (req, res) => {
  const userId = req.params.id;
  const { newUsername } = req.body;
  const authUserId = req.userId; // From requireAuth middleware

  // Validate that the authenticated user is updating their own username
  if (parseInt(userId) !== authUserId) {
    return res.status(403).json({ message: 'You can only update your own username' });
  }

  if (!newUsername || newUsername.trim() === '') {
    return res.status(400).json({ message: 'Username cannot be empty' });
  }

  const trimmedUsername = newUsername.trim();

  // Basic validation
  if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3-20 characters' });
  }

  // Check for invalid characters (basic example)
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
  }

  const conn = getConnection();

  try {
    // Check if username already exists
    const [existing] = await conn.promise().query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [trimmedUsername, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Update username
    const [result] = await conn.promise().query(
      'UPDATE users SET username = ? WHERE id = ?',
      [trimmedUsername, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get updated user data
    const [users] = await conn.promise().query(
      'SELECT id, username, email, profile_picture, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    const updatedUser = users[0];

    res.json({ 
      message: 'Username updated successfully',
      user: updatedUser
    });

  } catch (err) {
    console.error('Error updating username:', err);
    res.status(500).json({ message: 'Server error while updating username' });
  } finally {
    conn.end();
  }
});

app.get('/api/check-username', async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    return res.status(400).json({ 
      error: 'Username must be between 3-20 characters',
      available: false
    });
  }

  const conn = getConnection();

  try {
    // Check if username already exists
    const [existing] = await conn.promise().query(
      'SELECT id FROM users WHERE username = ?',
      [trimmedUsername]
    );

    return res.json({ 
      available: existing.length === 0,
      message: existing.length > 0 ? 'Username is taken' : 'Username is available'
    });
  
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.end();
  }
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});