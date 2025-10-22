const express = require('express');
const router = express.Router();
const db = require('../server');

// GET all posts
router.get('/', (req, res) => {
     const query = `SELECT posts.id, posts.title, posts.content, users.username AS author
                   FROM posts
                   JOIN users ON posts.author = users.id`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST create post
router.post('/', (req, res) => {
    const { title, content } = req.body;
     const query = 'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)';
    
    db.query(query, [title, content, author], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(`Post "${title}" created successfully`);
    });
});

module.exports = router;