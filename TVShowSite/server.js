import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for profile pictures
app.use('/assets/user_pfp', express.static(path.join(__dirname, 'src/assets/user_pfp')));

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'src/assets/user_pfp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const db = mysql.createConnection(dbConfig);
// TMDB base config
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.VITE_TMDB_API_KEY;

function getConnection() {
  return mysql.createConnection(dbConfig);
}
let cachedGenres = null;
let genreCacheTime = 0;
const GENRE_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function getGenreMap() {
  if (cachedGenres && Date.now() - genreCacheTime < GENRE_CACHE_TTL) {
    return cachedGenres;
  }

  const res = await axios.get(`${TMDB_BASE}/genre/tv/list`, {
    params: { api_key: TMDB_KEY }
  });

  cachedGenres = {};
  res.data.genres.forEach(g => {
    cachedGenres[g.id] = g.name;
  });

  genreCacheTime = Date.now();
  return cachedGenres;
}

function requireAuth(req, res, next) {
  const userId = req.headers.authorization;
  if (!userId || isNaN(userId)) return res.status(401).json({ message: 'Login required' });
  req.userId = parseInt(userId);
  next();
}

// Build recommendations for a given user id. Returns an array of recommendation objects.
async function buildDiscoverForUser(userId) {
  const genreMap = await getGenreMap();

  // 1. Get all series the user reviewed (count likes globally)
  // Previously this query only returned rows when rating >= 7 OR
  // the current user had liked the review; that caused an empty
  // resultset for users who had reviews but lower ratings and
  // therefore produced the public/fallback feed. We now return
  // all reviewed series and use weights later to prefer higher
  // ratings and popular likes.
  const [rows] = await db.promise().query(`
      SELECT
        r.tmdb_series_id,
        MAX(r.rating) AS rating,
        COUNT(DISTINCT rr.id) AS like_count
      FROM reviews r
      LEFT JOIN review_reactions rr
        ON rr.review_id = r.id
        AND rr.is_like = 1
      WHERE r.user_id = ?
      GROUP BY r.tmdb_series_id
    `, [userId]);

  if (!rows.length) {
    // fallback pool
    let fallbackResults = [];
    const sources = ['top_rated', 'popular'];
    for (const source of sources) {
      for (let page = 1; page <= 3; page++) {
        try {
          const r = await axios.get(`${TMDB_BASE}/tv/${source}`, {
            params: { api_key: TMDB_KEY, page }
          });
          fallbackResults.push(...(r.data.results || []));
        } catch (e) {}
        if (fallbackResults.length >= 120) break;
      }
      if (fallbackResults.length >= 120) break;
    }

    const seen = new Set();
    const deduped = [];
    for (const s of fallbackResults) {
      if (!s || seen.has(s.id)) continue;
      seen.add(s.id);
      deduped.push(s);
      if (deduped.length >= 60) break;
    }

    return deduped.map(show => {
      const vote = typeof show.vote_average === 'number' ? show.vote_average : 6.5;
      const scaled = Math.round(45 + (vote / 10) * 50);
      const jitter = Math.floor(Math.random() * 7) - 3;
      const score = Math.min(95, Math.max(40, scaled + jitter));
      const stars = Math.min(5, Math.max(1, Math.round(((score - 40) / 55) * 4) + 1));

      const genres = (show.genre_ids || []).map(id => genreMap[id]).filter(Boolean);
      const because = genres.length ? `Popular ${genres[0]} pick` : 'Popular pick';

      return {
        id: show.id,
        tmdbId: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        genres,
        matchScore: score,
        matchStars: stars,
        because,
        becauseIsTitle: false
      };
    });
  }

  const likedSeriesIds = rows.map(r => r.tmdb_series_id);

  // Build weighted genre profile
  const genreWeights = {};
  const sourceSeries = [];

  await Promise.all(
    rows.map(async row => {
      const tmdbRes = await axios.get(`${TMDB_BASE}/tv/${row.tmdb_series_id}`, {
        params: { api_key: TMDB_KEY }
      });

      sourceSeries.push({
        id: row.tmdb_series_id,
        title: tmdbRes.data.name,
        genres: (tmdbRes.data.genres || []).map(g => g.id)
      });

      const weight = (row.rating || 7) + row.like_count * 2;

      (tmdbRes.data.genres || []).forEach(g => {
        genreWeights[g.id] = (genreWeights[g.id] || 0) + weight;
      });
    })
  );

  // Pick several top genres (expanded) and query per-genre to
  // increase diversity (prevents a single dominant genre like
  // Animation from overwhelming results).
  const topGenreIds = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  // Discover from TMDB: query each top genre separately and
  // aggregate results to avoid overfitting to one genre.
  let results = [];
  for (const gid of topGenreIds) {
    for (let page = 1; page <= 3; page++) {
      try {
        const discoverRes = await axios.get(`${TMDB_BASE}/discover/tv`, {
          params: {
            api_key: TMDB_KEY,
            with_genres: gid,
            sort_by: 'popularity.desc',
            page
          }
        });
        results.push(...discoverRes.data.results);
      } catch (e) {
        // ignore individual failures and continue
      }
      if (results.length >= 120) break;
    }
    if (results.length >= 120) break;
  }

  results = results.filter(show => !likedSeriesIds.includes(show.id));

  // wildcard
  let wildcard = null;
  try {
    const wildcardRes = await axios.get(`${TMDB_BASE}/tv/trending/week`, { params: { api_key: TMDB_KEY } });
    const wildcardCandidate = wildcardRes.data.results.find(s => !likedSeriesIds.includes(s.id));
    if (wildcardCandidate) {
      wildcard = {
        id: wildcardCandidate.id,
        tmdbId: wildcardCandidate.id,
        title: wildcardCandidate.name,
        poster: wildcardCandidate.poster_path ? `https://image.tmdb.org/t/p/w500${wildcardCandidate.poster_path}` : null,
        genres: wildcardCandidate.genre_ids.map(id => genreMap[id]).filter(Boolean),
        matchScore: 65,
        matchStars: Math.min(5, Math.max(1, Math.round(((65 - 40) / 55) * 4) + 1)),
        because: wildcardCandidate.name || 'Trending',
        becauseIsTitle: Boolean(wildcardCandidate.name)
      };
    }
  } catch (e) {}

  // dedupe aggregated results by id (keep first occurrence)
  const seenResults = new Set();
  const uniqueResults = [];
  for (const s of results) {
    if (!s || seenResults.has(s.id)) continue;
    seenResults.add(s.id);
    uniqueResults.push(s);
    if (uniqueResults.length >= 80) break;
  }

  const recommendations = uniqueResults.map(show => {
      const sharedGenres = (show.genre_ids || []).filter(id => genreWeights[id]);

      const totalSharedWeight = sharedGenres.reduce((s, id) => s + (genreWeights[id] || 0), 0);
      const maxWeight = Math.max(...Object.values(genreWeights), 1);
      let scaled = 40 + (totalSharedWeight / (maxWeight * 3)) * 55;
      const jitter = Math.floor(Math.random() * 7) - 3;
      scaled = Math.round((scaled || 40) + jitter);
      const score = Math.min(95, Math.max(40, scaled));

      let bestOverlap = 0;
      const candidates = [];
      for (const src of sourceSeries) {
        const overlap = (src.genres || []).filter(g => (show.genre_ids || []).includes(g)).length;
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          candidates.length = 0;
          candidates.push(src);
        } else if (overlap === bestOverlap) {
          candidates.push(src);
        }
      }

      let because = 'Recommended for you';
      let becauseIsTitle = false;
      if (candidates.length && bestOverlap > 0) {
        const titles = [...new Set(candidates.map(c => c.title).filter(Boolean))];
        if (titles.length === 1) {
          because = titles[0];
          becauseIsTitle = true;
        } else if (titles.length > 1) {
          const short = titles.length <= 3 ? titles.join(' and ') : `${titles[0]} and others`;
          because = short;
          becauseIsTitle = true;
        }
      } else if (show.genre_ids && show.genre_ids.length) {
        const firstGenre = genreMap[show.genre_ids[0]];
        if (firstGenre) {
          because = `shows like ${firstGenre}`;
          becauseIsTitle = false;
        }
      }

      const stars = Math.min(5, Math.max(1, Math.round(((score - 40) / 55) * 4) + 1));
      return {
        id: show.id,
        tmdbId: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        genres: (show.genre_ids || []).map(id => genreMap[id]).filter(Boolean),
        matchScore: score,
        matchStars: stars,
        because,
        becauseIsTitle
      };
    });

  if (wildcard) {
    recommendations.push(wildcard);
  }

  // sort by matchScore descending so highest matches appear first
  recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return recommendations;
}

// Fetch episode info from TMDB
async function fetchEpisodeFromTMDB(seriesId, seasonNumber, episodeNumber) {
  const url = `${TMDB_BASE}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_KEY}`;
  const res = await axios.get(url);
  return res.data; // includes episode title, air_date, still_path, etc.
}

// Daily quote
app.get('/api/daily-quote', async (req, res) => {
  try {
    let response;
    let attempts = 0;
    let cleanedText;
    do {
      response = await axios.get('https://quotes.jepcd.com/quotes?short=true');
      let text = response.data.text;
      // Remove brackets
      text = text.replace(/\[.*?\]/g, '');
      // Remove before colon
      const colonIndex = text.indexOf(':');
      if (colonIndex !== -1) {
        text = text.substring(colonIndex + 1).trim();
      }
      cleanedText = text;
      attempts++;
    } while (cleanedText.split(' ').length > 10 && attempts < 10);
    res.json({ text: response.data.text, series: response.data.show });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch daily quote' });
  }
});

// Register
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, 'user'], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || 'Registration failed' });
      res.status(200).json({ message: 'User registered successfully' });
    });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        profile_picture: user.profile_picture,
        selected_badge_id: user.selected_badge_id
      }
    });
  });
});

app.get('/api/discover', requireAuth, async (req, res) => {
  try {
    const recs = await buildDiscoverForUser(req.userId);
    res.json(recs);
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ message: 'Failed to load discover feed' });
  }
});

// Emulate discover for a given user id (no auth) - useful for testing
app.get('/api/discover/emulate/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId || isNaN(userId)) return res.status(400).json({ message: 'Invalid user id' });

  try {
    const recs = await buildDiscoverForUser(userId);
    res.json(recs);
  } catch (err) {
    console.error('Emulate discover error:', err);
    res.status(500).json({ message: 'Failed to load emulate discover feed' });
  }
});

// Public discover for development/testing (no auth required)
app.get('/api/discover/public', async (req, res) => {
  try {
    const genreMap = await getGenreMap();

    // Build a larger, varied fallback pool (top-rated + popular)
    let fallbackResults = [];
    const sources = ['top_rated', 'popular'];
    for (const source of sources) {
      for (let page = 1; page <= 3; page++) {
        try {
          const r = await axios.get(`${TMDB_BASE}/tv/${source}`, {
            params: { api_key: TMDB_KEY, page }
          });
          fallbackResults.push(...(r.data.results || []));
        } catch (e) {
          // ignore page fetch errors and continue
        }
        if (fallbackResults.length >= 120) break;
      }
      if (fallbackResults.length >= 120) break;
    }

    // dedupe by id and limit
    const seen = new Set();
    const deduped = [];
    for (const s of fallbackResults) {
      if (!s || seen.has(s.id)) continue;
      seen.add(s.id);
      deduped.push(s);
      if (deduped.length >= 60) break;
    }

    const mapped = deduped.map(show => {
      const vote = typeof show.vote_average === 'number' ? show.vote_average : 6.5;
      const scaled = Math.round(45 + (vote / 10) * 50); // 45..95
      // add small jitter
      const jitter = Math.floor(Math.random() * 7) - 3;
      const score = Math.min(95, Math.max(40, scaled + jitter));
      const stars = Math.min(5, Math.max(1, Math.round(((score - 40) / 55) * 4) + 1));

      const genres = (show.genre_ids || []).map(id => genreMap[id]).filter(Boolean);
      const because = genres.length ? `Popular ${genres[0]} pick` : 'Popular pick';

      return {
        id: show.id,
        tmdbId: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        genres,
        matchScore: score,
        matchStars: stars,
        because,
        becauseIsTitle: false
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('Public discover error:', err);
    res.status(500).json({ message: 'Failed to load public discover feed' });
  }
});



// Add review
app.post('/api/reviews', requireAuth, async (req, res) => {
  const { tmdb_series_id, season_number, episode_number, rating, review_text, review_title } = req.body;
  if (
    !Number.isInteger(tmdb_series_id) ||
    !Number.isInteger(season_number) ||
    !Number.isInteger(episode_number)
  ) {
    return res.status(400).json({ error: 'Invalid TMDB identifiers' });
  }

  const query = `
    INSERT INTO reviews 
      (user_id, tmdb_series_id, season_number, episode_number, rating, review_text, review_title, date, likes, dislikes, comment_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0, 0)
  `;
  db.query(query, [req.userId, tmdb_series_id, season_number, episode_number, rating, review_text, review_title],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      res.status(201).json({ message: 'Review created', reviewId: result.insertId });
    });
});

// Get series list
app.get('/api/series', (req, res) => {
  db.query('SELECT * FROM series', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch series' });
    res.json(rows);
  });
});

// Get TMDB episode directly
app.get('/api/tmdb/episode', async (req, res) => {
  const { seriesId, seasonNumber, episodeNumber } = req.query;
  if (!seriesId || !seasonNumber || !episodeNumber) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const data = await fetchEpisodeFromTMDB(seriesId, seasonNumber, episodeNumber);
    res.json(data);
  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch episode from TMDB' });
  }
});


// Get all reviews with TMDB episode info
app.get('/api/reviews', async (req, res) => {
  const { seriesId, userId } = req.query;

  try {
    // Step 1: Fetch reviews from DB (still using user info and review stats)
    let query = `
          SELECT
      r.*,
      u.username,
      u.profile_picture,
      (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE user_id = u.id
      ) AS user_review_count,
      (
        SELECT AVG(r2.rating)
        FROM reviews r2
        WHERE
          r2.tmdb_series_id = r.tmdb_series_id
          AND r2.season_number = r.season_number
          AND r2.episode_number = r.episode_number
      ) AS average_rating
    FROM reviews r
    JOIN users u ON r.user_id = u.id

    `;
    const params = [];
    if (seriesId) {
      query += ' WHERE r.tmdb_series_id = ?';
      params.push(seriesId);
    } else if (userId) {
      query += ' WHERE r.user_id = ?';
      params.push(userId);
    }

    const [reviewRows] = await db.promise().query(query, params);

    if (reviewRows.length === 0) return res.json([]);

    const seriesIds = [...new Set(reviewRows.map(r => r.tmdb_series_id))];
    const seriesTitles = {};

    await Promise.all(
      seriesIds.map(async id => {
        const res = await axios.get(`${TMDB_BASE}/tv/${id}`, {
          params: { api_key: TMDB_KEY }
        });
        seriesTitles[id] = res.data.name;
      })
    );


    // Step 2: For each review, fetch episode info from TMDB API
    const tmdbApiKey = process.env.VITE_TMDB_API_KEY;

    const reviewsWithEpisodes = await Promise.all(
    reviewRows.map(async review => {
      try {
        const epRes = await axios.get(
          `${TMDB_BASE}/tv/${review.tmdb_series_id}/season/${review.season_number}/episode/${review.episode_number}`,
          { params: { api_key: TMDB_KEY } }
        );

        return {
          ...review,
          series_title: seriesTitles[review.tmdb_series_id] || 'Unknown Series',
          episode_title: epRes.data.name,
          episode_picture: epRes.data.still_path
            ? `https://image.tmdb.org/t/p/w500${epRes.data.still_path}`
            : null
        };
      } catch {
        return {
          ...review,
          series_title: seriesTitles[review.tmdb_series_id] || 'Unknown Series',
          episode_title: `S${review.season_number}E${review.episode_number}`,
          episode_picture: null
        };
      }
    })
  );


    res.json(reviewsWithEpisodes);

  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});
// GET /api/user-reviews/:userId
app.get('/api/user-reviews/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    db.query('SELECT * FROM reviews WHERE user_id = ? ORDER BY date DESC', [userId], async (err, reviews) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (!reviews.length) return res.json([]);

      // Collect unique series+season combinations
      const uniqueSeriesSeason = [...new Set(reviews.map(r => `${r.tmdb_series_id}-${r.season_number}`))];

      const episodesData = {};
      const seriesTitles = {};

      // One request per series-season (can reduce further if needed)
      await Promise.all(uniqueSeriesSeason.map(async (ss) => {
        const [seriesId, seasonNumber] = ss.split('-');

        // Fetch series info once
        if (!seriesTitles[seriesId]) {
          const seriesRes = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
            params: { api_key: process.env.VITE_TMDB_API_KEY }
          });
          seriesTitles[seriesId] = seriesRes.data.name;
        }

        // Fetch season info once
        const seasonRes = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}`, {
          params: { api_key: process.env.VITE_TMDB_API_KEY }
        });

        seasonRes.data.episodes.forEach(ep => {
          episodesData[`${seriesId}-${seasonNumber}-${ep.episode_number}`] = ep;
        });
      }));

      // Map reviews with TMDB info
      const enrichedReviews = reviews.map(r => {
        const ep = episodesData[`${r.tmdb_series_id}-${r.season_number}-${r.episode_number}`];
        return {
          ...r,
          series_title: seriesTitles[r.tmdb_series_id] || 'Unknown Series',
          episode_title: ep ? ep.name : `S${r.season_number}E${r.episode_number}`,
          episode_image: ep && ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null
        };
      });

      res.json(enrichedReviews);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});
// Statistics
app.get('/api/statistics', async (req, res) => {
  const userId = req.headers.authorization ? parseInt(req.headers.authorization) : null;

  try {
    // Site-wide stats
    const [highestRated] = await db.promise().query(
      `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       GROUP BY tmdb_series_id
       ORDER BY avg_rating DESC
       LIMIT 1`
    );

    const [lowestRated] = await db.promise().query(
      `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       GROUP BY tmdb_series_id
       ORDER BY avg_rating ASC
       LIMIT 1`
    );

    const [mostReviewed] = await db.promise().query(
      `SELECT tmdb_series_id, COUNT(*) as review_count
       FROM reviews
       GROUP BY tmdb_series_id
       ORDER BY review_count DESC
       LIMIT 1`
    );

    const globalStats = {
      highestRated: highestRated[0] || null,
      lowestRated: lowestRated[0] || null,
      mostReviewed: mostReviewed[0] || null
    };

    let userStats = null;
    if (userId) {
      const [uHighest] = await db.promise().query(
        `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM reviews
         WHERE user_id = ?
         GROUP BY tmdb_series_id
         ORDER BY avg_rating DESC
         LIMIT 1`, [userId]
      );

      const [uLowest] = await db.promise().query(
        `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM reviews
         WHERE user_id = ?
         GROUP BY tmdb_series_id
         ORDER BY avg_rating ASC
         LIMIT 1`, [userId]
      );

      const [uMost] = await db.promise().query(
        `SELECT tmdb_series_id, COUNT(*) as review_count
         FROM reviews
         WHERE user_id = ?
         GROUP BY tmdb_series_id
         ORDER BY review_count DESC
         LIMIT 1`, [userId]
      );

      userStats = {
        highestRated: uHighest[0] || null,
        lowestRated: uLowest[0] || null,
        mostReviewed: uMost[0] || null
      };
    }

    res.json({ globalStats, userStats });

  } catch (err) {
    console.error('Statistics fetch failed:', err);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});


// React to a review (like/dislike)
app.post('/api/reviews/:id/react', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { is_like } = req.body;
  const userId = req.userId;
  const isLikeInt = is_like ? 1 : 0;

  try {
    const [reviewRows] = await db.promise().query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (reviewRows.length === 0) return res.status(404).json({ message: 'Review not found' });

    const [existingReaction] = await db.promise().query(
      'SELECT is_like FROM review_reactions WHERE user_id = ? AND review_id = ?',
      [userId, id]
    );

    if (existingReaction.length > 0) {
      if (existingReaction[0].is_like === isLikeInt) {
        await db.promise().query('DELETE FROM review_reactions WHERE user_id = ? AND review_id = ?', [userId, id]);
      } else {
        await db.promise().query('UPDATE review_reactions SET is_like = ? WHERE user_id = ? AND review_id = ?', [isLikeInt, userId, id]);
      }
    } else {
      await db.promise().query('INSERT INTO review_reactions (user_id, review_id, is_like) VALUES (?, ?, ?)', [userId, id, isLikeInt]);
    }

    const [counts] = await db.promise().query(
      'SELECT SUM(is_like = 1) AS likes, SUM(is_like = 0) AS dislikes FROM review_reactions WHERE review_id = ?',
      [id]
    );

    await db.promise().query('UPDATE reviews SET likes = ?, dislikes = ? WHERE id = ?', [counts[0].likes || 0, counts[0].dislikes || 0, id]);

    res.json({ message: 'Reaction processed', likes: counts[0].likes || 0, dislikes: counts[0].dislikes || 0 });

  } catch (err) {
    console.error('Error processing reaction:', err);
    res.status(500).json({ message: 'Failed to process reaction' });
  }
});

// Check if username is available
app.get('/api/check-username', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ available: false });
  }

  db.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ available: false });
      }

      res.json({ available: results.length === 0 });
    }
  );
});

// Update username
app.put('/api/users/:id/username', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;
  const { newUsername } = req.body;

  if (!newUsername || newUsername.trim().length < 3) {
    return res.status(400).json({ message: 'Invalid username' });
  }

  // Users can only update their own username
  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // Check if username already exists
  db.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [newUsername],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // Update username
      db.query(
        'UPDATE users SET username = ? WHERE id = ?',
        [newUsername, userIdFromParams],
        err => {
          if (err) {
            return res.status(500).json({ message: 'Failed to update username' });
          }

          res.json({
            message: 'Username updated',
            user: {
              id: userIdFromParams,
              username: newUsername
            }
          });
        }
      );
    }
  );
});

// Upload profile picture
app.post('/api/users/:id/profile-picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  console.log('Profile picture upload request - Params ID:', userIdFromParams, 'Auth ID:', userIdFromAuth);

  // Users can only update their own profile picture
  if (userIdFromParams !== userIdFromAuth) {
    console.log('Unauthorized - ID mismatch');
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filename = req.file.filename;
  const profilePicturePath = `/assets/user_pfp/${filename}`;

  console.log('Uploaded file:', filename);
  console.log('Profile picture path:', profilePicturePath);

  // Get old profile picture to delete it
  db.query('SELECT profile_picture FROM users WHERE id = ?', [userIdFromParams], (err, results) => {
    if (err) {
      console.error('Error fetching old profile picture:', err);
    } else if (results.length > 0 && results[0].profile_picture) {
      const oldPicPath = results[0].profile_picture;
      // Only delete if it's not the default picture
      if (oldPicPath && !oldPicPath.includes('defaultpfp')) {
        const oldFilePath = path.join(__dirname, 'src', oldPicPath);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old profile picture:', err);
        });
      }
    }
  });

  // Update profile picture in database
  db.query(
    'UPDATE users SET profile_picture = ? WHERE id = ?',
    [profilePicturePath, userIdFromParams],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update profile picture' });
      }

      res.json({
        message: 'Profile picture updated',
        profilePicture: profilePicturePath
      });
    }
  );
});

// Update profile picture with default option
app.post('/api/users/:id/profile-picture-default', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  // Users can only update their own profile picture
  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { picturePath } = req.body;
  
  if (!picturePath || !picturePath.startsWith('/assets/user_pfp/pfp')) {
    return res.status(400).json({ message: 'Invalid picture path' });
  }

  console.log('Selecting default profile picture:', picturePath);

  db.query(
    'UPDATE users SET profile_picture = ? WHERE id = ?',
    [picturePath, userIdFromParams],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update profile picture' });
      }

      res.json({
        message: 'Profile picture updated',
        profilePicture: picturePath
      });
    }
  );
});

// User favorites routes
app.get('/api/users/:id/favorites', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  db.query(
    'SELECT position, tmdb_series_id FROM user_favorites WHERE user_id = ? ORDER BY position',
    [userIdFromParams],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch favorites' });
      }
      res.json(results);
    }
  );
});

app.post('/api/users/:id/favorites', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { tmdb_series_id, position } = req.body;

  if (!tmdb_series_id || !position || position < 1 || position > 5) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  db.query(
    'INSERT INTO user_favorites (user_id, tmdb_series_id, position) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tmdb_series_id = VALUES(tmdb_series_id)',
    [userIdFromParams, tmdb_series_id, position],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to save favorite' });
      }
      res.json({ message: 'Favorite saved' });
    }
  );
});

app.delete('/api/users/:id/favorites/:position', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;
  const position = parseInt(req.params.position);

  if (userIdFromParams !== userIdFromAuth || !position || position < 1 || position > 5) {
    return res.status(403).json({ message: 'Unauthorized or invalid position' });
  }

  db.query(
    'DELETE FROM user_favorites WHERE user_id = ? AND position = ?',
    [userIdFromParams, position],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to remove favorite' });
      }
      res.json({ message: 'Favorite removed' });
    }
  );
});

// User top shows route
app.get('/api/user-top-shows/:id', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  db.query(
    `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
     FROM reviews
     WHERE user_id = ?
     GROUP BY tmdb_series_id
     ORDER BY avg_rating DESC
     LIMIT 5`,
    [userIdFromParams],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch top shows' });
      }
      res.json(results);
    }
  );
});

// Add comment
app.post('/api/reviews/:id/comments', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { comment_text, other_user_id } = req.body;
  const userId = req.userId;

  if (!comment_text || comment_text.trim() === '') return res.status(400).json({ message: 'Empty comment not allowed' });

  const conn = getConnection();
  conn.query(
    'INSERT INTO comments (user_id, review_id, comment_text, other_user_id) VALUES (?, ?, ?, ?)',
    [userId, id, comment_text, other_user_id || null],
    (err) => {
      if (err) { conn.end(); return res.status(500).json({ message: 'Failed to add comment' }); }
      conn.query('UPDATE reviews SET comment_count = comment_count + 1 WHERE id = ?', [id], (err2) => {
        conn.end();
        if (err2) return res.status(500).json({ message: 'Failed to update comment count' });
        res.json({ message: 'Comment added' });
      });
    }
  );
});

// Get comments for a review
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
      if (err) return res.status(500).json({ message: 'Failed to load comments' });
      res.json(results);
    }
  );
});

// Delete review
app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const [reviewRows] = await db.promise().query('SELECT user_id FROM reviews WHERE id = ?', [id]);
    if (reviewRows.length === 0) return res.status(404).json({ message: 'Review not found' });

    const [userRows] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return res.status(403).json({ message: 'User not found' });

    const isOwner = reviewRows[0].user_id === userId;
    const isAdmin = userRows[0].role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized to delete this review' });

    await db.promise().query('DELETE FROM reviews WHERE id = ?', [id]);
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
    const [commentRows] = await db.promise().query('SELECT user_id, review_id FROM comments WHERE id = ?', [id]);
    if (commentRows.length === 0) return res.status(404).json({ message: 'Comment not found' });

    const [userRows] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return res.status(403).json({ message: 'User not found' });

    const isOwner = commentRows[0].user_id === userId;
    const isAdmin = userRows[0].role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized to delete this comment' });

    await db.promise().query('DELETE FROM comments WHERE id = ?', [id]);
    await db.promise().query('UPDATE reviews SET comment_count = comment_count - 1 WHERE id = ?', [commentRows[0].review_id]);

    res.json({ message: 'Comment deleted successfully' });

  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// ===== QUIZ ENDPOINTS =====

// Get all quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const [quizzes] = await db.promise().query('SELECT id, title, description, icon_emoji, created_at FROM quizzes ORDER BY created_at DESC');
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Get specific quiz with questions
app.get('/api/quizzes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [quiz] = await db.promise().query('SELECT id, title, description, icon_emoji FROM quizzes WHERE id = ?', [id]);
    if (quiz.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const [questions] = await db.promise().query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d FROM quiz_questions WHERE quiz_id = ? ORDER BY id',
      [id]
    );

    res.json({ ...quiz[0], questions });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// Get user's earned badges
app.get('/api/users/:userid/badges', async (req, res) => {
  const { userid } = req.params;
  try {
    const [badges] = await db.promise().query(
      `SELECT q.id, q.title, q.icon_emoji, ub.earned_at
       FROM user_badges ub
       JOIN quizzes q ON ub.quiz_id = q.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [userid]
    );
    res.json(badges);
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// Get badge details including completion status for user
app.get('/api/users/:userid/quiz-status/:quizid', requireAuth, async (req, res) => {
  const { userid, quizid } = req.params;
  try {
    const [badge] = await db.promise().query(
      'SELECT * FROM user_badges WHERE user_id = ? AND quiz_id = ?',
      [userid, quizid]
    );
    res.json({ completed: badge.length > 0, earnedAt: badge.length > 0 ? badge[0].earned_at : null });
  } catch (err) {
    console.error('Error checking badge status:', err);
    res.status(500).json({ message: 'Failed to check quiz status' });
  }
});

// Check quiz cooldown status - returns if user can retake after failure
app.get('/api/quizzes/:id/cooldown-status', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Get the most recent failed attempt (score < 70)
    const [attempts] = await db.promise().query(
      'SELECT score, attempted_at FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND score < 70 ORDER BY attempted_at DESC LIMIT 1',
      [userId, id]
    );

    if (attempts.length === 0) {
      // No failed attempts, user can retake
      return res.json({ canRetake: true, cooldownExpired: true, nextRetakeTime: null });
    }

    const lastFailedAttempt = new Date(attempts[0].attempted_at);
    const now = new Date();
    const hoursElapsed = (now - lastFailedAttempt) / (1000 * 60 * 60);

    if (hoursElapsed >= 24) {
      // 24 hours have passed
      return res.json({ canRetake: true, cooldownExpired: true, nextRetakeTime: null });
    }

    // Still in cooldown
    const nextRetakeTime = new Date(lastFailedAttempt.getTime() + 24 * 60 * 60 * 1000);
    return res.json({ 
      canRetake: false, 
      cooldownExpired: false, 
      nextRetakeTime: nextRetakeTime.toISOString(),
      hoursRemaining: Math.ceil((24 - hoursElapsed) * 100) / 100
    });
  } catch (err) {
    console.error('Error checking quiz cooldown:', err);
    res.status(500).json({ message: 'Failed to check quiz cooldown' });
  }
});

// Submit quiz answers and award badge if score is >= 70%
app.post('/api/quizzes/:id/submit', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { answers } = req.body; // Object: { questionId: 'A', questionId2: 'B', ... }

  try {
    // Fetch all questions for this quiz
    const [questions] = await db.promise().query(
      'SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?',
      [id]
    );

    if (questions.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    // Calculate score
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id].toUpperCase() === q.correct_answer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);

    // Record attempt
    await db.promise().query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, score) VALUES (?, ?, ?)',
      [userId, id, score]
    );

    // Award badge if score >= 70 and user doesn't already have it
    let badgeAwarded = false;
    if (score >= 70) {
      try {
        await db.promise().query(
          'INSERT INTO user_badges (user_id, quiz_id) VALUES (?, ?)',
          [userId, id]
        );
        badgeAwarded = true;
      } catch (err) {
        // Badge already exists, that's fine
        if (err.code !== 'ER_DUP_ENTRY') throw err;
      }
    }

    res.json({
      score,
      totalQuestions: questions.length,
      correctAnswers: correct,
      passed: score >= 70,
      badgeAwarded,
      message: score >= 70 
        ? badgeAwarded 
          ? 'Congratulations! You earned a badge! 🎉'
          : 'You already earned this badge!'
        : 'Keep practicing!'
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// Admin: Create a new quiz
app.post('/api/admin/quizzes', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { title, description, icon_emoji, questions } = req.body;

  try {
    // Check if user is admin
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create quizzes' });
    }

    // Create quiz
    const [result] = await db.promise().query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      [title, description, icon_emoji, userId]
    );

    const quizId = result.insertId;

    // Insert questions
    if (questions && questions.length > 0) {
      for (const q of questions) {
        await db.promise().query(
          'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
        );
      }
    }

    res.status(201).json({ message: 'Quiz created', quizId });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

// Admin: Delete a quiz
app.delete('/api/admin/quizzes/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Check if user is admin
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete quizzes' });
    }

    await db.promise().query('DELETE FROM quizzes WHERE id = ?', [id]);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ message: 'Failed to delete quiz' });
  }
});

// ===== QUIZ ENDPOINTS END =====

// Fetch series details including seasons
app.get('/api/tmdb/series-seasons/:id', async (req, res) => {
  const seriesId = req.params.id;
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
      params: { api_key: process.env.VITE_TMDB_API_KEY }
    });
    res.json(response.data); // this includes series info + seasons
  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series data' });
  }
});


app.get('/api/tmdb/top-series', async (req, res) => {
  try {
    // 1. Fetch the genre list from TMDB
    const genreRes = await axios.get('https://api.themoviedb.org/3/genre/tv/list', {
      params: { api_key: process.env.VITE_TMDB_API_KEY, language: 'en-US' }
    });
    const genreMap = {};
    genreRes.data.genres.forEach(g => { genreMap[g.id] = g.name; });

    // 2. Fetch the popular TV shows (first page)
    const response = await axios.get('https://api.themoviedb.org/3/tv/popular', {
      params: { api_key: process.env.VITE_TMDB_API_KEY, language: 'en-US', page: 1 }
    });

    // 3. Take top 12 shows and map genre IDs to names
    const shows = response.data.results.slice(0, 12).map(show => ({
      id: show.id,
      title: show.name,
      description: show.overview,
      release_year: show.first_air_date ? parseInt(show.first_air_date.slice(0, 4)) : null,
      series_picture: show.poster_path,
      genres: show.genre_ids.map(id => genreMap[id] || id) // map to text
    }));

    res.json(shows);

  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch TMDB series' });
  }
});


// Fetch series details including all seasons & episodes (single call per series)
app.get('/api/tmdb/series-details/:id', async (req, res) => {
  const seriesId = req.params.id;
  try {
    const seriesRes = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
      params: { api_key: process.env.VITE_TMDB_API_KEY }
    });

    // Fetch episodes for all seasons
    const seasonsWithEpisodes = await Promise.all(
      (seriesRes.data.seasons || []).map(async season => {
        const epRes = await axios.get(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${season.season_number}`,
          { params: { api_key: process.env.VITE_TMDB_API_KEY } }
        );
        return { ...season, episodes: epRes.data.episodes || [] };
      })
    );

    res.json({ ...seriesRes.data, seasons: seasonsWithEpisodes });

  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series details' });
  }
});
// Fetch series videos (trailers)
app.get('/api/tmdb/series-videos/:id', async (req, res) => {
  const seriesId = req.params.id;
  try {
    const videosRes = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/videos`, {
      params: { api_key: process.env.VITE_TMDB_API_KEY, language: 'en-US' }
    });

    const videos = videosRes.data?.results || [];
    const channelHints = ['TV Promos', 'Rotten Tomatoes', 'Paramount Plus'];
    const preferred = videos.filter(v => v.site === 'YouTube' && channelHints.some(h => (v.name || '').toLowerCase().includes(h.toLowerCase())));
    const trailer = preferred.find(v => v.type === 'Trailer')
      || preferred.find(v => v.type === 'Teaser')
      || videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
      || videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
      || videos.find(v => v.site === 'YouTube');

    if (!trailer) return res.json({ key: null });

    res.json({ key: trailer.key, name: trailer.name, type: trailer.type });
  } catch (err) {
    console.error('TMDB videos fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series videos' });
  }
});
// Search series by query (TMDB)
app.get('/api/tmdb/search-series', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]); // return empty array if no query

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/tv', {
      params: { api_key: process.env.VITE_TMDB_API_KEY, query, language: 'en-US', page: 1 }
    });

    const results = response.data.results.map(show => ({
      id: show.id,
      title: show.name,
      series_picture: show.poster_path
    }));

    res.json(results);
  } catch (err) {
    console.error('TMDB search error:', err.message);
    res.status(500).json({ message: 'Failed to search series' });
  }
});

// ===== NEW FEATURES: PUBLIC PROFILES, WATCHED SHOWS, FOLLOWED SHOWS, USER LISTS, NOTIFICATIONS =====

// Get public profile of another user
app.get('/api/users/:userId/public-profile', async (req, res) => {
  const { userId } = req.params;

  try {
    const [users] = await db.promise().query(
      'SELECT id, username, profile_picture, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];

    // Get user reviews count
    const [reviewCounts] = await db.promise().query(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [userId]
    );

    // Get followed shows count
    const [followedCounts] = await db.promise().query(
      'SELECT COUNT(*) as count FROM followed_shows WHERE user_id = ?',
      [userId]
    );

    // Get badges
    const [badges] = await db.promise().query(
      `SELECT ub.*, q.title, q.icon_emoji FROM user_badges ub
       JOIN quizzes q ON ub.quiz_id = q.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [userId]
    );

    // Get user's public lists
    const [lists] = await db.promise().query(
      'SELECT * FROM user_lists WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      user,
      reviewCount: reviewCounts[0].count,
      followedShowsCount: followedCounts[0].count,
      badges,
      publicLists: lists
    });
  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Get single review with all details
app.get('/api/reviews/:reviewId', async (req, res) => {
  const { reviewId } = req.params;

  try {
    const [reviews] = await db.promise().query(
      `SELECT r.*, u.username, u.profile_picture
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reviewId]
    );

    if (reviews.length === 0) return res.status(404).json({ message: 'Review not found' });

    const review = reviews[0];

    // Get total user reviews
    const [userReviews] = await db.promise().query(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [review.user_id]
    );

    // Get TMDB series details
    const seriesRes = await axios.get(`${TMDB_BASE}/tv/${review.tmdb_series_id}`, {
      params: { api_key: TMDB_KEY }
    });

    // Get episode details
    const episodeRes = await axios.get(
      `${TMDB_BASE}/tv/${review.tmdb_series_id}/season/${review.season_number}/episode/${review.episode_number}`,
      { params: { api_key: TMDB_KEY } }
    );

    // Get comments
    const [comments] = await db.promise().query(
      `SELECT c.*, u.username, u.profile_picture FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.review_id = ?
       ORDER BY c.date ASC`,
      [reviewId]
    );

    res.json({
      review,
      seriesInfo: seriesRes.data,
      episodeInfo: episodeRes.data,
      userReviewCount: userReviews[0].count,
      comments
    });
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ message: 'Failed to fetch review' });
  }
});

// Mark show as watched
app.post('/api/watched-shows', requireAuth, async (req, res) => {
  const { tmdb_series_id, watched_status } = req.body;
  const userId = req.userId;

  try {
    const [existing] = await db.promise().query(
      'SELECT * FROM watched_shows WHERE user_id = ? AND tmdb_series_id = ?',
      [userId, tmdb_series_id]
    );

    if (existing.length > 0) {
      await db.promise().query(
        'UPDATE watched_shows SET watched_status = ? WHERE user_id = ? AND tmdb_series_id = ?',
        [watched_status, userId, tmdb_series_id]
      );
    } else {
      await db.promise().query(
        'INSERT INTO watched_shows (user_id, tmdb_series_id, watched_status) VALUES (?, ?, ?)',
        [userId, tmdb_series_id, watched_status]
      );
    }

    res.json({ message: 'Show watch status updated' });
  } catch (err) {
    console.error('Error updating watched show:', err);
    res.status(500).json({ message: 'Failed to update watch status' });
  }
});

// Mark episode as watched
app.post('/api/watched-episodes', requireAuth, async (req, res) => {
  const { tmdb_series_id, season_number, episode_number } = req.body;
  const userId = req.userId;

  try {
    const [existing] = await db.promise().query(
      'SELECT * FROM watched_episodes WHERE user_id = ? AND tmdb_series_id = ? AND season_number = ? AND episode_number = ?',
      [userId, tmdb_series_id, season_number, episode_number]
    );

    if (existing.length === 0) {
      await db.promise().query(
        'INSERT INTO watched_episodes (user_id, tmdb_series_id, season_number, episode_number) VALUES (?, ?, ?, ?)',
        [userId, tmdb_series_id, season_number, episode_number]
      );
    }

    res.json({ message: 'Episode marked as watched' });
  } catch (err) {
    console.error('Error marking episode as watched:', err);
    res.status(500).json({ message: 'Failed to mark episode as watched' });
  }
});

// Get watched shows for user
app.get('/api/watched-shows/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [watched] = await db.promise().query(
      'SELECT * FROM watched_shows WHERE user_id = ?',
      [userId]
    );

    res.json(watched);
  } catch (err) {
    console.error('Error fetching watched shows:', err);
    res.status(500).json({ message: 'Failed to fetch watched shows' });
  }
});

// Get watched episodes for show
app.get('/api/watched-episodes/:userId/:seriesId', async (req, res) => {
  const { userId, seriesId } = req.params;

  try {
    const [episodes] = await db.promise().query(
      'SELECT * FROM watched_episodes WHERE user_id = ? AND tmdb_series_id = ?',
      [userId, seriesId]
    );

    res.json(episodes);
  } catch (err) {
    console.error('Error fetching watched episodes:', err);
    res.status(500).json({ message: 'Failed to fetch watched episodes' });
  }
});

// Follow a show
app.post('/api/follow-show', requireAuth, async (req, res) => {
  const { tmdb_series_id } = req.body;
  const userId = req.userId;

  try {
    const [existing] = await db.promise().query(
      'SELECT * FROM followed_shows WHERE user_id = ? AND tmdb_series_id = ?',
      [userId, tmdb_series_id]
    );

    if (existing.length === 0) {
      await db.promise().query(
        'INSERT INTO followed_shows (user_id, tmdb_series_id) VALUES (?, ?)',
        [userId, tmdb_series_id]
      );
    }

    res.json({ message: 'Show followed' });
  } catch (err) {
    console.error('Error following show:', err);
    res.status(500).json({ message: 'Failed to follow show' });
  }
});

// Unfollow show
app.post('/api/unfollow-show', requireAuth, async (req, res) => {
  const { tmdb_series_id } = req.body;
  const userId = req.userId;

  try {
    await db.promise().query(
      'DELETE FROM followed_shows WHERE user_id = ? AND tmdb_series_id = ?',
      [userId, tmdb_series_id]
    );

    res.json({ message: 'Show unfollowed' });
  } catch (err) {
    console.error('Error unfollowing show:', err);
    res.status(500).json({ message: 'Failed to unfollow show' });
  }
});

// Get followed shows for user
app.get('/api/followed-shows/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [shows] = await db.promise().query(
      'SELECT * FROM followed_shows WHERE user_id = ?',
      [userId]
    );

    res.json(shows);
  } catch (err) {
    console.error('Error fetching followed shows:', err);
    res.status(500).json({ message: 'Failed to fetch followed shows' });
  }
});

// Get notifications for user
app.get('/api/notifications', requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const [notifications] = await db.promise().query(
      `SELECT n.* FROM notifications n
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    await db.promise().query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Create user list
app.post('/api/user-lists', requireAuth, async (req, res) => {
  const { name, description, is_public } = req.body;
  const userId = req.userId;

  try {
    const [result] = await db.promise().query(
      'INSERT INTO user_lists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
      [userId, name, description, is_public ? 1 : 0]
    );

    res.status(201).json({ message: 'List created', listId: result.insertId });
  } catch (err) {
    console.error('Error creating user list:', err);
    res.status(500).json({ message: 'Failed to create list' });
  }
});

// Get user lists
app.get('/api/user-lists/:userId', async (req, res) => {
  const { userId } = req.params;
  const authUserId = req.headers.authorization ? parseInt(req.headers.authorization) : null;

  try {
    let query = 'SELECT * FROM user_lists WHERE user_id = ?';
    const params = [userId];

    // If not the same user and not looking at public lists
    if (authUserId !== parseInt(userId)) {
      query += ' AND is_public = 1';
    }

    query += ' ORDER BY created_at DESC';

    const [lists] = await db.promise().query(query, params);

    // Get items for each list
    const listsWithItems = await Promise.all(lists.map(async (list) => {
      const [items] = await db.promise().query(
        'SELECT * FROM user_list_items WHERE list_id = ?',
        [list.id]
      );
      return { ...list, items };
    }));

    res.json(listsWithItems);
  } catch (err) {
    console.error('Error fetching user lists:', err);
    res.status(500).json({ message: 'Failed to fetch lists' });
  }
});

// Add show to list
app.post('/api/user-lists/:listId/items', requireAuth, async (req, res) => {
  const { listId } = req.params;
  const { tmdb_series_id } = req.body;
  const userId = req.userId;

  try {
    // Check that the list belongs to the user
    const [lists] = await db.promise().query(
      'SELECT user_id FROM user_lists WHERE id = ?',
      [listId]
    );

    if (lists.length === 0 || lists[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const [existing] = await db.promise().query(
      'SELECT * FROM user_list_items WHERE list_id = ? AND tmdb_series_id = ?',
      [listId, tmdb_series_id]
    );

    if (existing.length === 0) {
      await db.promise().query(
        'INSERT INTO user_list_items (list_id, tmdb_series_id) VALUES (?, ?)',
        [listId, tmdb_series_id]
      );
    }

    res.json({ message: 'Show added to list' });
  } catch (err) {
    console.error('Error adding to list:', err);
    res.status(500).json({ message: 'Failed to add to list' });
  }
});

// Remove show from list
app.delete('/api/user-lists/:listId/items/:itemId', requireAuth, async (req, res) => {
  const { listId, itemId } = req.params;
  const userId = req.userId;

  try {
    // Check that the list belongs to the user
    const [lists] = await db.promise().query(
      'SELECT user_id FROM user_lists WHERE id = ?',
      [listId]
    );

    if (lists.length === 0 || lists[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.promise().query(
      'DELETE FROM user_list_items WHERE id = ? AND list_id = ?',
      [itemId, listId]
    );

    res.json({ message: 'Show removed from list' });
  } catch (err) {
    console.error('Error removing from list:', err);
    res.status(500).json({ message: 'Failed to remove from list' });
  }
});

// Delete user list
app.delete('/api/user-lists/:listId', requireAuth, async (req, res) => {
  const { listId } = req.params;
  const userId = req.userId;

  try {
    const [lists] = await db.promise().query(
      'SELECT user_id FROM user_lists WHERE id = ?',
      [listId]
    );

    if (lists.length === 0 || lists[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.promise().query(
      'DELETE FROM user_list_items WHERE list_id = ?',
      [listId]
    );

    await db.promise().query(
      'DELETE FROM user_lists WHERE id = ?',
      [listId]
    );

    res.json({ message: 'List deleted' });
  } catch (err) {
    console.error('Error deleting list:', err);
    res.status(500).json({ message: 'Failed to delete list' });
  }
});

// Update user list
app.put('/api/user-lists/:listId', requireAuth, async (req, res) => {
  const { listId } = req.params;
  const { name, description, is_public } = req.body;
  const userId = req.userId;

  try {
    const [lists] = await db.promise().query(
      'SELECT user_id FROM user_lists WHERE id = ?',
      [listId]
    );

    if (lists.length === 0 || lists[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.promise().query(
      'UPDATE user_lists SET name = ?, description = ?, is_public = ? WHERE id = ?',
      [name, description, is_public ? 1 : 0, listId]
    );

    res.json({ message: 'List updated' });
  } catch (err) {
    console.error('Error updating list:', err);
    res.status(500).json({ message: 'Failed to update list' });
  }
});

// Select badge to display on profile
app.post('/api/users/:userId/select-badge', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const { badgeId } = req.body;
  const authUserId = req.userId;

  if (parseInt(userId) !== authUserId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the badge belongs to this user
    const [badges] = await db.promise().query(
      'SELECT * FROM user_badges WHERE id = ? AND user_id = ?',
      [badgeId, userId]
    );

    if (badges.length === 0) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    // Update users table with selected badge
    await db.promise().query(
      'UPDATE users SET selected_badge_id = ? WHERE id = ?',
      [badgeId, userId]
    );

    res.json({ message: 'Badge selected for profile' });
  } catch (err) {
    console.error('Error selecting badge:', err);
    res.status(500).json({ message: 'Failed to select badge' });
  }
});

// Get user's profile comments (comments posted by the user)
app.get('/api/users/:userId/comments', async (req, res) => {
  const { userId } = req.params;

  try {
    const [comments] = await db.promise().query(
      `SELECT c.*, u.username, u.profile_picture, r.id as review_id, r.review_title
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN reviews r ON c.review_id = r.id
       WHERE c.user_id = ?
       ORDER BY c.date DESC`,
      [userId]
    );

    res.json(comments);
  } catch (err) {
    console.error('Error fetching user comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});






db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
  
  // Create user_favorites table if not exists
  db.query(`CREATE TABLE IF NOT EXISTS user_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    position INT NOT NULL,
    UNIQUE KEY unique_user_position (user_id, position),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_favorites table:', err);
    else console.log('user_favorites table ready');
  });

  // Create quizzes table
  db.query(`CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating quizzes table:', err);
    else console.log('quizzes table ready');
  });

  // Create quiz_questions table
  db.query(`CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating quiz_questions table:', err);
    else console.log('quiz_questions table ready');
  });

  // Create user_badges table (represents earned badges)
  db.query(`CREATE TABLE IF NOT EXISTS user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (user_id, quiz_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_badges table:', err);
    else console.log('user_badges table ready');
  });

  // Create quiz_attempts table (track all attempts)
  db.query(`CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating quiz_attempts table:', err);
    else console.log('quiz_attempts table ready');
  });

  // Create watched_shows table
  db.query(`CREATE TABLE IF NOT EXISTS watched_shows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    watched_status VARCHAR(50) DEFAULT 'partially',
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_series (user_id, tmdb_series_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating watched_shows table:', err);
    else console.log('watched_shows table ready');
  });

  // Create watched_episodes table
  db.query(`CREATE TABLE IF NOT EXISTS watched_episodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    season_number INT NOT NULL,
    episode_number INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_episode (user_id, tmdb_series_id, season_number, episode_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating watched_episodes table:', err);
    else console.log('watched_episodes table ready');
  });

  // Create followed_shows table
  db.query(`CREATE TABLE IF NOT EXISTS followed_shows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (user_id, tmdb_series_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating followed_shows table:', err);
    else console.log('followed_shows table ready');
  });

  // Create notifications table
  db.query(`CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT,
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating notifications table:', err);
    else console.log('notifications table ready');
  });

  // Create user_lists table
  db.query(`CREATE TABLE IF NOT EXISTS user_lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_lists table:', err);
    else console.log('user_lists table ready');
  });

  // Create user_list_items table
  db.query(`CREATE TABLE IF NOT EXISTS user_list_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    list_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_list_item (list_id, tmdb_series_id),
    FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_list_items table:', err);
    else console.log('user_list_items table ready');
  });

  // Add selected_badge_id column to users if not exists
  db.query(`ALTER TABLE users ADD COLUMN selected_badge_id INT`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for selected_badge_id');
  });
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
