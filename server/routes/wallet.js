// routes/investments.js
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../detabase.js');
const mysql = require('mysql');

router.get('/', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'wallet.html'));
});

router.get('/fetch', (req, res) => {
    const userId = req.session.userId;

    db.getConnection (async (err, connection)=> { 
        if (err) throw (err);

        const sqlSearch = "Select * from wallet where userId = ?";
        const search_query = mysql.format(sqlSearch, [userId]);
        connection.query(search_query, async (err, balance) => {
            if (err) throw err;

            if (balance.length == 0) {
                res.status(404).send({ error: 'User has no bank balance :(.' });
            } else {
                const planQuery = "Select * from planning where userId = ?";
                const search_planQuery = mysql.format(planQuery, [userId]);
                await connection.query (search_planQuery, async (err, planning) => {  
                    connection.release();
                    if (err) throw (err);
                    
                    if (planning.length == 0) {
                        res.status(404).send({ error: 'User has no planning.' });
                    } else {
                        res.send({ balance : balance, name: req.session.user, planning: planning });
                    }
                });
            }
        });
    });
})

router.post('/addplan', (req, res) => {
    const userId = req.session.userId;
    const { name, target } = req.body;

    db.getConnection(async (err, connection) => { 
        if (err) throw (err)
        
        const sqlSearch = "SELECT * FROM users WHERE userId = ?"
        const search_query = mysql.format(sqlSearch, [userId]) 
        const sqlInsert = "INSERT INTO planning (userId, total, name) VALUES (?, ?, ?)"
        const insert_query = mysql.format(sqlInsert, [userId, target, name])

        await connection.query (search_query, async (err, result) => {  
            connection.release();
            if (err) throw (err);

            if (result.length != 0) {
                await connection.query (insert_query, async (err, result) => {
                    if (err) throw (err);
                    console.log('added new planning')
                    res.send({ success: true })
                });
            } else {
                res.status(409).send({ error: 'User doesn\'t exist.' });
            }
        });
    });
})

router.post('/removeplan', (req, res) => {
    const id = req.body.id;

    db.getConnection(async (err, connection) => { 
        if (err) throw (err)
        
        const sqlInsert = "DELETE FROM planning WHERE planning_id = ?;"
        const insert_query = mysql.format(sqlInsert, [id])

        await connection.query (insert_query, async (err, result) => {
            connection.release();
            if (err) throw (err);

            console.log('added new planning')
            res.send({ success: true })
        });
    });
})

module.exports = router;
