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
    res.sendFile(path.join(clientPath, 'profile.html'));
});

router.get('/edit', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'edit_profile.html'));
})

router.get('/fetch', (req, res) => {
    const userId = req.session.userId;
    
    db.getConnection (async (err, connection)=> { 
        if (err) throw (err);
        
        const sqlSearch = "Select * from users where userId = ?";
        const search_query = mysql.format(sqlSearch, [userId]);
        
        await connection.query (search_query, (err, result) => {  
            connection.release();
            if (err) throw (err);
            
            if (result.length == 0) {
                res.status(404).send({ error: 'User not exist.' });
            } else {
                res.send({ data : result });
            }
        });
    });
});

router.post('/update', (req, res) => {
    const userId = req.session.userId;
    const { newName, newPhone, newEmail, newGender } = req.body;

    db.getConnection (async (err, connection) => {
        if (err) throw (err);

        const sqlUpdate = "UPDATE users SET userName = ?, phone = ?, email = ?, gender = ? WHERE userId = ?";
        const updateQuery = mysql.format(sqlUpdate, [newName, newPhone, newEmail, newGender, userId]);

        await connection.query(updateQuery, (err, result) => {
            connection.release();
            if (err){
                throw(err);
            } else {
                res.send({ data: 'success' });
            }
        });
    })

})

module.exports = router;
