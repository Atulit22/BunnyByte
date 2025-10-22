const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// DATABSE CONNECTION
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@Ayushisql18',
  databse: 'bunnyByte'
});

db.connect((err) => {
  if (err) {
    console.log('DB connection error:', err);
  } else {
    console.log('MySQL connected');
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Import routes
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = db;