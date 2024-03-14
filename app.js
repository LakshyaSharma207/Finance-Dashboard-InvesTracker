const express = require('express');
const mysql = require('mysql');

const app = express();

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'pass1234',
    database: 'finance_dashboard'
})

app.listen(3000, () => {
    console.log('server running at localhost:3000');
})

app.get('/add', (req, res) => {
    const name = 'Apple';

    db.query('INSERT INTO transaction (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.log(err);
        }

        res.send(result);
    })
})