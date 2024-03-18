// routes/investments.js
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../detabase.js');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const session = require('express-session');

router.get('/', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'transactions.html'));
});

router.get('/addnew', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'addTransaction.html'));
})

router.get('/fetch', (req, res) => {
    const userId = req.session.userId;

    db.getConnection (async (err, connection)=> { 
        if (err) throw (err);

        const sqlSearch = "Select * from transaction where userId = ?";
        const search_query = mysql.format(sqlSearch, [userId]);

        await connection.query (search_query, async (err, result) => {  
            connection.release();
            if (err) throw (err);
            
            if (result.length == 0) {
                res.status(404).send({ error: 'User has no transactions.' });
            } else {
                res.send({ data : result });
            }
        });
    });
});

router.post('/addnew', (req, res) => {
    const userId = req.session.userId;
    const { name, amount, type } = req.body;

    if(name.length < 1 || amount.length < 1) {
        res.status(400).send({ error: 'Name and Amount are required fields' });
    }
    db.getConnection(async (err, connection) => { 
        if (err) throw (err)
        
        const sqlSearch = "SELECT * FROM users WHERE userId = ?"
        const search_query = mysql.format(sqlSearch, [userId]) 
        const sqlInsert = "INSERT INTO transaction (type, date, name, amount, userId) VALUES (?, CURDATE(), ?, ?, ?)"
        const insert_query = mysql.format(sqlInsert, [type, name, amount, userId])

        await connection.query (search_query, async (err, result) => {  
            connection.release();
            if (err) throw (err);

            if (result.length != 0) {
                await connection.query (insert_query, async (err, result) => {
                    if (err) throw (err);
                    console.log('added new transaction')
                    res.send({ success: true })
                });
            } else {
                res.status(409).send({ error: 'User doesn\'t exist.' });
            }
        });
    });
})

module.exports = router;
