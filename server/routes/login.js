const express = require('express');
const router = express.Router();
const db = require('../detabase.js');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

router.get('/', (req, res) => {
    const clientPath = path.join(__dirname, '../../client');
    res.sendFile(path.join(clientPath, 'login.html'));
})

router.post("/authenticate", (req, res)=> {
    const user = req.body.name;
    const password = req.body.password;

    if (user.length <  1 || password.length < 6) {
        res.status(400).send({ error: 'User name and password are required.' });
        return;
    }

    db.getConnection (async (err, connection)=> { 
        if (err) throw (err)
        const sqlSearch = "Select * from users where userName = ?";
        const search_query = mysql.format(sqlSearch,[user]);
        
        await connection.query (search_query, async (err, result) => {  
            connection.release();
            if (err) throw (err);
            
            if (result.length == 0) {
                // console.log("User does not exist");
                res.status(404).send({ error: 'Incorrect Username or Password.' });
            } else {
                // get hashedpassword from result of mysql
                const hashedPassword = result[0].password
                if (await bcrypt.compare(password, hashedPassword)) {
                    // console.log("Login Successful");
                    const query = mysql.format("SELECT userId FROM users WHERE userName = ?", [user]);
                    const results = await new Promise((resolve, reject) => {
                        connection.query(query, (error, results) => {
                            if (error) reject(error);
                            else resolve(results);
                        });
                    });
                    req.session.userId = results[0].userId;
                    req.session.user = user;
                    res.send({ success: true })
                } else {
                    // console.log("Password Incorrect")
                    res.status(404).send({ error: 'Incorrect Username or Password.' });
                }
            }
        });
    });
}) 

module.exports = router;