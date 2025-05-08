import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

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

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
