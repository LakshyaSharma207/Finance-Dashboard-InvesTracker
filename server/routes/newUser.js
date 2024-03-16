const express = require('express');
const router = express.Router();
const db = require('../detabase.js');
const bcrypt = require("bcrypt");
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

router.get('/', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'signup.html'));
});

router.post('/createUser', async(req, res) => {
    const user = req.body.name;
    const password = req.body.password;

    if(user.length < 1 || password.length < 1){
        // console.log('Empty fields');
        res.status(400).send({ error: 'User name and password are required.' });
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    db.getConnection(async (err, connection) => { 
        if (err) throw (err)
        const sqlSearch = "SELECT * FROM users WHERE userName = ?"
        const search_query = mysql.format(sqlSearch, [user]) 
        const sqlInsert = "INSERT INTO users (userName, password) VALUES (?, ?)"
        const insert_query = mysql.format(sqlInsert, [user, hashedPassword])

        await connection.query (search_query, async (err, result) => {  
            if (err) throw (err);
            console.log(result.length);
            if (result.length != 0) {
             connection.release();
            //  console.log("User already exists");
             res.status(409).send({ error: 'User already exists.' });;
            } else {
                await connection.query (insert_query, async (err, result) => {
                    connection.release();
                    if (err) throw (err);

                    const query = mysql.format("SELECT userId FROM users WHERE userName = ?", [user]);
                    const results = await new Promise((resolve, reject) => {
                        connection.query(query, (error, results) => {
                            if (error) reject(error);
                            else resolve(results);
                        });
                    });
                    console.log("Created new User");
                    const wallet_query = mysql.format("INSERT INTO wallet (userId, type, amount) VALUES (?, ?, ?)", [results[0].userId, 'visa', 1000])
                    await connection.query (wallet_query, (err, result) => {
                        if (err) throw (err);

                        console.log('created new wallet');
                        req.session.userId = results[0].userId;
                        req.session.user = user;
                        res.send({ success: true })
                    })
                });
            }
        });
    });
})

module.exports = router;