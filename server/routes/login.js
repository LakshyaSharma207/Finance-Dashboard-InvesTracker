const express = require('express');
const router = express.Router();
const db = require('../detabase.js');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

router.post("/login", (req, res)=> {
    const user = req.body.username;
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
                    console.log("Login Successful");
                    req.session.userName = user;
                    // res.send(`${user} is logged in!`)
                } else {
                    // console.log("Password Incorrect")
                    res.status(404).send({ error: 'Incorrect Username or Password.' });
                }
            }
        });
    });
}) 

module.exports = router;