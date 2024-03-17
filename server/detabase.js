const mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit: 10, 
    host: 'localhost',
    user: 'root',
    password: 'pass1234',
    database: 'finance_dashboard'
});

module.exports = db;
