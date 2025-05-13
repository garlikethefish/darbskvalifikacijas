import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import  bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'plottwizts'
});

// Daily Quote
function getDailyQuoteId(total) {
  const today = new Date().toISOString().slice(0, 10);
  const hash = [...today].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % total) + 1;
}

// Change quote on refresh
app.get('/api/daily-quote', (req, res) => {
  db.query('SELECT * FROM quotes ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err || results.length === 0) return res.status(500).send(err);
    res.json(results[0]);
  });
});


// // Change quote daily
// app.get('/api/daily-quote', (req, res) => {
//   db.query('SELECT COUNT(*) AS count FROM quotes', (err, results) => {
//     if (err) return res.status(500).send(err);

//     const count = results[0].count;
//     const id = getDailyQuoteId(count);

//     db.query('SELECT * FROM quotes WHERE id = ?', [id], (err2, results2) => {
//       if (err2 || results2.length === 0) return res.status(500).send(err2);
//       res.json(results2[0]);
//     });
//   });
// });


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

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});



db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
