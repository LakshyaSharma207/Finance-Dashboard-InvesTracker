// routes/investments.js
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../detabase.js');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

router.get('/', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'investments.html'));
});

router.get('/get', (req, res) => {
    db.getConnection()
});

module.exports = router;
