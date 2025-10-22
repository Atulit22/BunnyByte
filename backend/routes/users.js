const express = require('express');
const router = express.Router();
const db = require('../server');

// GET all users
router.get('/', (req, res) => {
    const query = 'SELECT id, username FROM users';
    db.query(query, (err, results) => {
          if (err) return res.status(500).send(err);
          res.json(results);
    });
});

// POST signup
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users(username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(`User ${username} signed up successfully`);
    });
});

// POST login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.send(`User ${username} logged in successfully`);
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

module.exports = router;